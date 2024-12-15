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
import { UUIDV4Param } from '../common/decorators/uuid-param.decorator';
import { ResponseService } from '../common/services/response.service';
import { transformToDto } from '../utilities/transform.util';
import { AdminResponseDto } from './dto/admin-response.dto';

@Controller('admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.create(createAdminDto);
    return this.responseService.success('Admin created successfully', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Get()
  async findAll() {
    const admins = await this.adminsService.findAll();
    return this.responseService.success('Admins retrieved successfully', {
      admins: admins.map((admin) => transformToDto(AdminResponseDto, admin)),
    });
  }

  @Get(':id')
  async findOne(@UUIDV4Param() id: string) {
    const admin = await this.adminsService.findOne(id);
    return this.responseService.success('Admin retrieved successfully', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Patch(':id')
  async update(
    @UUIDV4Param() id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return this.responseService.success('Admin updated successfully', {
      admin: transformToDto(AdminResponseDto, updatedAdmin),
    });
  }

  @Delete(':id')
  async remove(@UUIDV4Param() id: string) {
    await this.adminsService.softDelete(id);
    return this.responseService.success('Admin soft deleted successfully');
  }

  @Patch('/restore/:id')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const restoredAdmin = await this.adminsService.restore(id);
    return this.responseService.success('Admin restored successfully', {
      admin: transformToDto(AdminResponseDto, restoredAdmin),
    });
  }

  @Delete('/hard-delete/:id')
  async hardDelete(@UUIDV4Param() id: string) {
    await this.adminsService.hardDelete(id);
    return this.responseService.success('Admin hard deleted successfully');
  }
}
