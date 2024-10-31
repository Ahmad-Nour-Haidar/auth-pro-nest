import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';

@Injectable()
export class AdminsService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admins`;
  }

  findOne(id: string) {
    return `This action returns a #${id} admin`;
  }

  update(id: string, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: string) {
    return `This action removes a #${id} admin`;
  }

  createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto) {
    return 'This action adds a new super admin';
  }

  updateSuperAdmin(id: string, updateSuperAdminDto: UpdateSuperAdminDto) {
    return 'This action adds a new super admin';
  }
}
