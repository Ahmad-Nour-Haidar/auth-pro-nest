// src/users/user.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { User } from './entities/user.entity';
import { BcryptService } from './services/bcrypt.service';
import { CreateMethod } from '../auth/enums/create-method.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    createMethod: CreateMethod,
  ): Promise<User> {
    // Check if the email or username already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    // If the user exists, throw a conflict exception with a specific message
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists'); // Email conflict
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists'); // Username conflict
      }
    }

    // Hash the password
    createUserDto.password = await this.bcryptService.hash(
      createUserDto.password,
    );
    console.log(createUserDto);
    // Create the user object with the hashed password
    const user = this.usersRepository.create({
      ...createUserDto,
      create_method: createMethod,
    });

    return await this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Retrieve the existing user
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    // Check if the update data is identical to the existing data for unique fields
    if (user.email === updateUserDto.email) {
      delete updateUserDto.email;
    }
    if (user.username === updateUserDto.username) {
      delete updateUserDto.username;
    }

    // If there is no data left to update, return the existing user
    if (Object.keys(updateUserDto).length === 0) {
      return user;
    }

    await this.usersRepository.update({ id }, updateUserDto);

    return { ...user, ...updateUserDto };
  }

  async updateRoles(id: string, updateUserRolesDto: UpdateUserRolesDto) {
    // Retrieve the existing user
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.roles = updateUserRolesDto.roles;
    return await this.usersRepository.save(user);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async softDelete(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.deleted_at = new Date();
    return await this.usersRepository.save(user);
  }

  async restore(id: string) {
    // Check if the user exists and is soft deleted
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: true, // includes soft-deleted records in the search
    });

    if (!user || !user.deleted_at) {
      throw new NotFoundException(
        `User with ID ${id} not found or not deleted`,
      );
    }

    // Restore the user
    await this.usersRepository.restore(id);

    return { message: `User with ID ${id} has been restored` };
  }

  async hardDelete(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return await this.usersRepository.remove(user);
  }
}
