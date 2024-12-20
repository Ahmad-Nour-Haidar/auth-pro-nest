import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AdditionalDataToCreateUser } from './types/additional-data-to-create-user';
import { Roles } from '../admins/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    additionalDataToCreateUser: AdditionalDataToCreateUser,
  ): Promise<User> {
    // Check if the email or username already exists
    await this.checkForExistingUser(createUserDto);

    // Hash the password
    createUserDto.password = await this.bcryptService.hash(
      createUserDto.password,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      ...additionalDataToCreateUser,
      roles: [Roles.user],
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      withDeleted: true,
    });
  }

  async findOne(id: string): Promise<User> {
    return this.getUserById({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.usersRepository.update({ id }, updateUserDto);
      return this.getUserById({ id });
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation error code for PostgresSQL
        if (error.detail.includes('email')) {
          throw new ConflictException('Email already in use');
        }
        if (error.detail.includes('username')) {
          throw new ConflictException('Username already in use');
        }
      }
      throw error; // Re-throw the error if it's not a unique constraint violation
    }
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (user.deleted_at) {
      throw new ConflictException(`User with ID ${id} is already soft-deleted`);
    }
    user.deleted_at = new Date();
    return this.usersRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });

    if (!user.deleted_at) {
      throw new ConflictException(`User with ID ${id} is not soft deleted`);
    }

    const result = await this.usersRepository.restore(id);

    if (result.affected === 1) {
      user.deleted_at = null;
      return user;
    } else {
      throw new InternalServerErrorException(
        `User with ID ${id} could not be restored due to a database error`,
      );
    }
  }

  async hardDelete(id: string): Promise<User> {
    const user = await this.getUserById({ id });
    return this.usersRepository.remove(user);
  }

  async blockUser(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (user.blocked_at) {
      throw new ConflictException(`User with ID ${id} is already blocked`);
    }
    user.blocked_at = new Date();

    return this.usersRepository.save(user);
  }

  async unblockUser(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (!user.blocked_at) {
      throw new ConflictException(`User with ID ${id} is not blocked`);
    }
    user.blocked_at = null;
    return this.usersRepository.save(user);
  }

  private async checkForExistingUser(
    createUserDto: CreateUserDto,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already in use'); // Email conflict
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already in use'); // Username conflict
      }
    }
  }

  private async getUserById({
    id,
    withDeleted = true,
  }: {
    id: string;
    withDeleted?: boolean;
  }): Promise<User> {
    // await this.usersRepository.findOneBy({ id }, { withDeleted: true });
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: withDeleted,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
