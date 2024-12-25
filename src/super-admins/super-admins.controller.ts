import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ResponseService } from '../common/services/response.service';
import { Roles } from '../admins/enums/roles.enum';
import { SuperAdminAccessPassword } from './decorators/access-password.decorator';
import { AccessPasswordGuard } from './guards/access-password.guard';
import { transformToDto } from '../common/util/transform.util';
import { AdminResponseDto } from '../admins/dto/admin-response.dto';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';

@Controller('super-admins')
@UseGuards(AccessPasswordGuard)
@SuperAdminAccessPassword()
export class SuperAdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post()
  async create(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    const superAdmin = await this.adminsService.create({
      ...createSuperAdminDto,
      roles: [Roles.superAdmin],
    });
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.super_admin_created_successfully),
      {
        super_admin: transformToDto(AdminResponseDto, superAdmin),
      },
    );
  }
}
