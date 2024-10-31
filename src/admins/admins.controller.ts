import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { LodashService } from '../common/services/lodash.service';
import { ResponseService } from '../common/services/response.service';

@Controller('admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly lodashService: LodashService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = this.lodashService.omitKeys(
      await this.adminsService.create(createAdminDto),
      ['password', 'password_changed_at', 'last_login_at', 'last_logout_at'],
    );
    return this.responseService.success('Admin created successfully', {
      admin,
    });
  }

  @Get()
  async findAll() {
    return await this.adminsService.findAll();
  }

  @Get(':id')
  async findOne(@UUIDParam() id: string) {
    return await this.adminsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @UUIDParam() id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return await this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  async remove(@UUIDParam() id: string) {
    return await this.adminsService.softDelete(id); // Soft delete
  }

  @Delete('/hard-delete/:id')
  async hardDelete(@UUIDParam() id: string) {
    return await this.adminsService.hardDelete(id); // Hard delete
  }

  @Post('/restore/:id')
  async restore(@UUIDParam() id: string) {
    return await this.adminsService.restore(id); // Restore soft-deleted admin
  }

  @Post('/super-admins')
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return await this.adminsService.createSuperAdmin(createSuperAdminDto);
  }

  @Patch('/super-admins/:id')
  async updateSuperAdmin(
    @UUIDParam() id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    return await this.adminsService.updateSuperAdmin(id, updateSuperAdminDto);
  }
}
