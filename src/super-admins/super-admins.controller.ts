import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ResponseService } from '../common/services/response.service';
import { Roles } from '../admins/enums/roles.enum';
import { SuperAdminAccessPassword } from './decorators/access-password.decorator';
import { AccessPasswordGuard } from './guards/access-password.guard';
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
}
