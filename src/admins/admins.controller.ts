import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  findOne(@UUIDParam() id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  update(@UUIDParam() id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  remove(@UUIDParam() id: string) {
    return this.adminsService.remove(id);
  }

  @Post('/super-admins')
  createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.adminsService.createSuperAdmin(createSuperAdminDto);
  }

  @Patch('/super-admins/:id')
  updateSuperAdmin(
    @UUIDParam() id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    return this.adminsService.updateSuperAdmin(id, updateSuperAdminDto);
  }
}
