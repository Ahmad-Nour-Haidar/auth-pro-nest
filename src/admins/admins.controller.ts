import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { LodashService } from '../common/services/lodash.service';
import { ResponseService } from '../common/services/response.service';
import { Admin } from './entities/admin.entity';

@Controller('admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly lodashService: LodashService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.create(createAdminDto);
    return this.responseService.success('Admin created successfully', {
      admin: this.formatAdmin(admin),
    });
  }

  @Get()
  async findAll() {
    const admins = await this.adminsService.findAll();
    return this.responseService.success('Admins retrieved successfully', {
      admins: admins.map((admin) => this.formatAdmin(admin)),
    });
  }

  @Get(':id')
  async findOne(@UUIDParam() id: string) {
    const admin = await this.adminsService.findOne(id);
    return this.responseService.success('Admin retrieved successfully', {
      admin: this.formatAdmin(admin),
    });
  }

  @Patch(':id')
  async update(
    @UUIDParam() id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return this.responseService.success('Admin updated successfully', {
      admin: this.formatAdmin(updatedAdmin),
    });
  }

  @Delete(':id')
  async remove(@UUIDParam() id: string) {
    await this.adminsService.softDelete(id);
    return this.responseService.success('Admin soft deleted successfully');
  }

  @Patch('/restore/:id')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const restoredAdmin = await this.adminsService.restore(id);
    return this.responseService.success('Admin restored successfully', {
      admin: this.formatAdmin(restoredAdmin),
    });
  }

  @Delete('/hard-delete/:id')
  async hardDelete(@UUIDParam() id: string) {
    await this.adminsService.hardDelete(id);
    return this.responseService.success('Admin hard deleted successfully');
  }

  @Post('/super-admins')
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    const superAdmin =
      await this.adminsService.createSuperAdmin(createSuperAdminDto);
    return this.responseService.success('Super Admin created successfully', {
      admin: this.formatAdmin(superAdmin),
    });
  }

  @Patch('/super-admins/:id')
  async updateSuperAdmin(
    @UUIDParam() id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    const updatedSuperAdmin = await this.adminsService.update(
      id,
      updateSuperAdminDto,
    );
    return this.responseService.success('Super Admin updated successfully', {
      admin: this.formatAdmin(updatedSuperAdmin),
    });
  }

  private formatAdmin(admin: Admin) {
    return this.lodashService.omitKeys(admin, [
      'password',
      'password_changed_at',
      'last_login_at',
      'last_logout_at',
    ]);
  }
}
