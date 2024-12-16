import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { ResponseService } from '../common/services/response.service';
import { isSuperAdmin, Roles } from '../admins/enums/roles.enum';
import { SuperAdminAccessPassword } from './decorators/access-password.decorator';
import { AccessPasswordGuard } from './guards/access-password.guard';
import { UUIDV4Param } from '../common/decorators/uuid-param.decorator';
import { transformToDto } from '../utilities/transform.util';
import { AdminResponseDto } from '../admins/dto/admin-response.dto';

@Controller('super-admins')
@UseGuards(AccessPasswordGuard)
@SuperAdminAccessPassword()
export class SuperAdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    const superAdmin = await this.adminsService.create({
      ...createSuperAdminDto,
      roles: [Roles.superAdmin],
    });
    return this.responseService.success('Super Admin created successfully', {
      super_admin: transformToDto(AdminResponseDto, superAdmin),
    });
  }

  @Patch(':id')
  async update(
    @UUIDV4Param() id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    const updatedSuperAdmin = await this.adminsService.update(
      id,
      updateSuperAdminDto,
    );
    return this.responseService.success('Super Admin updated successfully', {
      super_admin: transformToDto(AdminResponseDto, updatedSuperAdmin),
    });
  }

  @Get()
  async findAll() {
    const admins = await this.adminsService.findAll();
    const superAdmins = admins.filter((admin) => isSuperAdmin(admin.roles));
    return this.responseService.success('Super Admins retrieved successfully', {
      super_admins: superAdmins.map((superAdmin) =>
        transformToDto(AdminResponseDto, superAdmin),
      ),
    });
  }

  @Get(':id')
  async findOne(@UUIDV4Param() id: string) {
    const superAdmin = await this.adminsService.findOne(id);
    if (isSuperAdmin(superAdmin.roles)) {
      throw new NotFoundException(`Super Admin with ID ${id} not found`);
    }
    return this.responseService.success('Super Admin retrieved successfully', {
      super_admin: transformToDto(AdminResponseDto, superAdmin),
    });
  }

  @Delete(':id')
  async delete(@UUIDV4Param() id: string) {
    const deletedAdmin = await this.adminsService.softDelete(id);
    return this.responseService.success(
      'Super Admin soft deleted successfully',
      {
        super_admin: transformToDto(AdminResponseDto, deletedAdmin),
      },
    );
  }

  @Patch('/restore/:id')
  async restore(@UUIDV4Param() id: string) {
    const restoredSuperAdmin = await this.adminsService.restore(id);
    return this.responseService.success('Super Admin restored successfully', {
      super_admin: transformToDto(AdminResponseDto, restoredSuperAdmin),
    });
  }

  @Delete('/hard-delete/:id')
  async hardDelete(@UUIDV4Param() id: string) {
    await this.adminsService.hardDelete(id);
    return this.responseService.success(
      'Super Admin hard deleted successfully',
    );
  }

  @Patch('/block/:id')
  async block(@UUIDV4Param() id: string) {
    const superAdmin = await this.adminsService.blockAdmin(id);
    return this.responseService.success('Super Admin blocked successfully', {
      super_admin: transformToDto(AdminResponseDto, superAdmin),
    });
  }

  @Patch('/unblock/:id')
  async unblock(@UUIDV4Param() id: string) {
    const updatedAdmin = await this.adminsService.unblockAdmin(id);
    return this.responseService.success('Super Admin unblocked successfully', {
      super_admin: transformToDto(AdminResponseDto, updatedAdmin),
    });
  }
}
