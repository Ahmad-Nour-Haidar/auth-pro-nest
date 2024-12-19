import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UUIDV4Param } from '../common/decorators/uuid-param.decorator';
import { ResponseService } from '../common/services/response.service';
import { transformToDto } from '../utilities/transform.util';
import { AdminResponseDto } from './dto/admin-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentAdmin, SuperAdminOnly } from '../common/decorators';
import { Admin } from './entities/admin.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateMeAdminDto } from './dto/update-me-admin.dto';

@Controller('admins')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @SuperAdminOnly()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.create(createAdminDto);
    return this.responseService.success('Admin created successfully', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Patch('me')
  async updateMe(
    @CurrentAdmin() admin: Admin,
    @Body() updateMeAdminDto: UpdateMeAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(
      admin.id,
      updateMeAdminDto,
    );
    return this.responseService.success('msg', {
      admin: transformToDto(AdminResponseDto, updatedAdmin),
    });
  }

  @Patch(':id')
  @SuperAdminOnly()
  async update(
    @UUIDV4Param() id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return this.responseService.success('Admin updated successfully', {
      admin: transformToDto(AdminResponseDto, updatedAdmin),
    });
  }

  @Get()
  @SuperAdminOnly()
  async findAll() {
    const admins = await this.adminsService.findAll();
    return this.responseService.success('Admins retrieved successfully', {
      admins: admins.map((admin) => transformToDto(AdminResponseDto, admin)),
    });
  }

  @Get('me')
  async me(@CurrentAdmin() admin: Admin) {
    return this.responseService.success('msg', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Get(':id')
  @SuperAdminOnly()
  async findOne(@UUIDV4Param() id: string) {
    const admin = await this.adminsService.findOne(id);
    return this.responseService.success('Admin retrieved successfully', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Delete(':id')
  @SuperAdminOnly()
  async delete(@UUIDV4Param() id: string) {
    const deletedAdmin = await this.adminsService.softDelete(id);
    return this.responseService.success('Admin soft deleted successfully', {
      admin: transformToDto(AdminResponseDto, deletedAdmin),
    });
  }

  @Patch('/restore/:id')
  @SuperAdminOnly()
  async restore(@UUIDV4Param() id: string) {
    const restoredSuperAdmin = await this.adminsService.restore(id);
    return this.responseService.success('Admin restored successfully', {
      admin: transformToDto(AdminResponseDto, restoredSuperAdmin),
    });
  }

  @Delete('/hard-delete/:id')
  @SuperAdminOnly()
  async hardDelete(@UUIDV4Param() id: string) {
    await this.adminsService.hardDelete(id);
    return this.responseService.success('Admin hard deleted successfully');
  }

  @Patch('/block/:id')
  @SuperAdminOnly()
  async block(@UUIDV4Param() id: string) {
    const admin = await this.adminsService.blockAdmin(id);
    return this.responseService.success('Admin blocked successfully', {
      admin: transformToDto(AdminResponseDto, admin),
    });
  }

  @Patch('/unblock/:id')
  @SuperAdminOnly()
  async unblock(@UUIDV4Param() id: string) {
    const updatedAdmin = await this.adminsService.unblockAdmin(id);
    return this.responseService.success('Admin unblocked successfully', {
      admin: transformToDto(AdminResponseDto, updatedAdmin),
    });
  }
}
