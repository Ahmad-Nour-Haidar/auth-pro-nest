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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if the email or username already exists
    const existingUser = await this.userRepository.findOne({
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
    const hashedPassword = await this.bcryptService.hash(
      createUserDto.password,
    );

    // Create the user object with the hashed password
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword, // Store hashed password
    });

    return await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return await this.userRepository.save(user);
  }

  async updateRoles(id: string, updateUserRolesDto: UpdateUserRolesDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.roles = updateUserRolesDto.roles;
    return await this.userRepository.save(user);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async softDelete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.deleted_at = new Date();
    return await this.userRepository.save(user);
  }

  async hardDelete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return await this.userRepository.remove(user);
  }
}
