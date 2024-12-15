import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Check if the email or username already exists
    await this.checkForExistingAdmin(createAdminDto);

    // Hash the password
    createAdminDto.password = await this.bcryptService.hash(
      createAdminDto.password,
    );

    const admin = this.adminsRepository.create(createAdminDto);

    return this.adminsRepository.save(admin);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminsRepository.find({ withDeleted: true });
  }

  async findOne(id: string): Promise<Admin> {
    return this.getAdminById({ id });
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    try {
      await this.adminsRepository.update({ id }, updateAdminDto);

      return await this.getAdminById({ id });
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

  async softDelete(id: string): Promise<Admin> {
    const admin = await this.getAdminById({ id, withDeleted: true });
    if (admin.deleted_at) {
      throw new ConflictException(
        `Admin with ID ${id} is already soft-deleted`,
      );
    }
    admin.deleted_at = new Date();
    return this.adminsRepository.save(admin);
  }

  async restore(id: string): Promise<Admin> {
    // Check if the admin exists and is soft deleted
    const admin = await this.getAdminById({ id, withDeleted: true });

    if (!admin.deleted_at) {
      throw new ConflictException(`Admin with ID ${id} is not soft deleted`);
    }

    // Restore the admin
    const result = await this.adminsRepository.restore(id);

    if (result.affected === 1) {
      admin.deleted_at = null;
      return admin;
    } else {
      throw new InternalServerErrorException(
        `Admin with ID ${id} could not be restored due to a database error`,
      );
    }
  }

  async hardDelete(id: string): Promise<Admin> {
    const admin = await this.getAdminById({ id });
    return this.adminsRepository.remove(admin);
  }

  async blockAdmin(id: string): Promise<Admin> {
    const admin = await this.getAdminById({ id, withDeleted: true });
    if (admin.blocked_at) {
      throw new ConflictException(`Admin with ID ${id} is already blocked`);
    }
    admin.blocked_at = new Date();

    return this.adminsRepository.save(admin);
  }

  async unblockAdmin(id: string): Promise<Admin> {
    const admin = await this.getAdminById({ id, withDeleted: true });
    if (!admin.blocked_at) {
      throw new ConflictException(`Admin with ID ${id} is not blocked`);
    }
    admin.blocked_at = null;
    return this.adminsRepository.save(admin);
  }

  private async checkForExistingAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<void> {
    const existingAdmin = await this.adminsRepository.findOne({
      where: [
        { email: createAdminDto.email },
        { username: createAdminDto.username },
      ],
    });

    if (existingAdmin) {
      if (existingAdmin.email === createAdminDto.email) {
        throw new ConflictException('Email already in use'); // Email conflict
      }
      if (existingAdmin.username === createAdminDto.username) {
        throw new ConflictException('Username already in use'); // Username conflict
      }
    }
  }

  private async getAdminById({
    id,
    withDeleted = true,
  }: {
    id: string;
    withDeleted?: boolean;
  }): Promise<Admin> {
    const admin = await this.adminsRepository.findOne({
      where: { id },
      withDeleted: withDeleted, // Include soft-deleted records if true
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }
}
