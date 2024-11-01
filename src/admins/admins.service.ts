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

  findAll(): Promise<Admin[]> {
    return this.adminsRepository.find();
  }

  async findOne(id: string): Promise<Admin> {
    return this.getAdminById(id);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.getAdminById(id);

    // Check if the update data is identical to the existing data for unique fields
    if (admin.email === updateAdminDto.email) {
      delete updateAdminDto.email;
    }
    if (admin.username === updateAdminDto.username) {
      delete updateAdminDto.username;
    }

    // If there is no data left to update, return the existing admin
    if (Object.keys(updateAdminDto).length === 0) {
      return admin;
    }

    try {
      await this.adminsRepository.update({ id }, updateAdminDto);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation error code for PostgreSQL
        if (error.detail.includes('email')) {
          throw new ConflictException('Email already in use');
        }
        if (error.detail.includes('username')) {
          throw new ConflictException('Username already in use');
        }
      }
      throw error; // Re-throw the error if it's not a unique constraint violation
    }

    return { ...admin, ...updateAdminDto };
  }

  async softDelete(id: string): Promise<Admin> {
    const admin = await this.getAdminById(id);
    admin.deleted_at = new Date(); // Set the deleted_at field to mark as soft deleted
    return this.adminsRepository.save(admin);
  }

  async restore(id: string): Promise<Admin> {
    // Check if the admin exists and is soft deleted
    const admin = await this.adminsRepository.findOne({
      where: { id },
      withDeleted: true, // includes soft-deleted records in the search
    });

    if (!admin) {
      throw new NotFoundException(
        `Admin with ID ${id} not found or not soft deleted`,
      );
    }

    if (!admin.deleted_at) {
      throw new ConflictException(
        `Admin with ID ${id} is not soft deleted and cannot be restored`,
      );
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
    const admin = await this.getAdminById(id);
    return this.adminsRepository.remove(admin);
  }

  private async getAdminById(id: string): Promise<Admin> {
    const admin = await this.adminsRepository.findOneBy({ id });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
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
}
