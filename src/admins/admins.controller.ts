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
import { CurrentAdmin, SuperAdminOnly } from '../common/decorators';
import { Admin } from './entities/admin.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateMeAdminDto } from './dto/update-me-admin.dto';
import { JwtAuthAdminGuard } from '../admins-auth/guards/jwt-auth-admin.guard';
import { LodashService } from '../common/services/lodash.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { CustomI18nService } from '../common/services/custom-i18n.service';

@Controller('admins')
@UseGuards(JwtAuthAdminGuard, RolesGuard)
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
    private readonly lodashService: LodashService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post()
  @SuperAdminOnly()
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.create(createAdminDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_created),
      {
        admin: transformToDto(AdminResponseDto, admin),
      },
    );
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
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_me),
      {
        admin: this.lodashService.omitKeys(updatedAdmin, [
          'password',
          'password_changed_at',
          'verify_code',
        ]),
      },
    );
  }

  @Patch(':id')
  @SuperAdminOnly()
  async update(
    @UUIDV4Param() id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(id, updateAdminDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_updated),
      {
        admin: transformToDto(AdminResponseDto, updatedAdmin),
      },
    );
  }

  @Get()
  @SuperAdminOnly()
  async findAll() {
    const admins = await this.adminsService.findAll();
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admins_retrieved),
      {
        admins: admins.map((admin) => transformToDto(AdminResponseDto, admin)),
      },
    );
  }

  @Get('me')
  async me(@CurrentAdmin() admin: Admin) {
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_me),
      {
        admin: this.lodashService.omitKeys(admin, [
          'password',
          'password_changed_at',
          'verify_code',
        ]),
      },
    );
  }

  @Get(':id')
  @SuperAdminOnly()
  async findOne(@UUIDV4Param() id: string) {
    const admin = await this.adminsService.findOne(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_retrieved),
      {
        admin: transformToDto(AdminResponseDto, admin),
      },
    );
  }

  @Delete(':id')
  @SuperAdminOnly()
  async delete(@UUIDV4Param() id: string) {
    const deletedAdmin = await this.adminsService.softDelete(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_deleted),
      {
        admin: transformToDto(AdminResponseDto, deletedAdmin),
      },
    );
  }

  @Patch('/restore/:id')
  @SuperAdminOnly()
  async restore(@UUIDV4Param() id: string) {
    const restoredAdmin = await this.adminsService.restore(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_restored),
      {
        admin: transformToDto(AdminResponseDto, restoredAdmin),
      },
    );
  }

  @Delete('/hard-delete/:id')
  @SuperAdminOnly()
  async hardDelete(@UUIDV4Param() id: string) {
    await this.adminsService.hardDelete(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_hard_deleted),
    );
  }

  @Patch('/block/:id')
  @SuperAdminOnly()
  async block(@UUIDV4Param() id: string) {
    const admin = await this.adminsService.blockAdmin(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_blocked),
      {
        admin: transformToDto(AdminResponseDto, admin),
      },
    );
  }

  @Patch('/unblock/:id')
  @SuperAdminOnly()
  async unblock(@UUIDV4Param() id: string) {
    const updatedAdmin = await this.adminsService.unblockAdmin(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_unblocked),
      {
        admin: transformToDto(AdminResponseDto, updatedAdmin),
      },
    );
  }
}
