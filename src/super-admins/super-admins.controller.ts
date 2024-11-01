import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { ResponseService } from '../common/services/response.service';
import { LodashService } from '../common/services/lodash.service';
import { Roles } from '../admins/enums/roles.enum';
import { SuperAdminAccessPassword } from './decorators/access-password.decorator';
import { AccessPasswordGuard } from './guards/access-password.guard';

@Controller('super-admins')
@UseGuards(AccessPasswordGuard)
export class SuperAdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
    private readonly lodashService: LodashService,
  ) {}

  @Post()
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    const superAdmin = await this.adminsService.create({
      ...createSuperAdminDto,
      roles: [Roles.SuperAdmin],
    });
    return this.responseService.success('Super Admin created successfully', {
      'super-admin': this.formatAdmin(superAdmin),
    });
  }
  @SuperAdminAccessPassword()
  @Patch(':id')
  async updateSuperAdmin(
    @UUIDParam() id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    const updatedSuperAdmin = await this.adminsService.update(
      id,
      updateSuperAdminDto,
    );
    return this.responseService.success('Super Admin updated successfully', {
      'super-admin': this.formatAdmin(updatedSuperAdmin),
    });
  }

  private formatAdmin(admin: any) {
    return this.lodashService.omitKeys(admin, [
      'password',
      'password_changed_at',
      'last_login_at',
      'last_logout_at',
    ]);
  }
}
