import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UUIDV4Param } from '../common/decorators';
import { ResponseService } from '../common/services/response.service';
import { transformToDto } from '../common/util/transform.util';
import { AdminResponseDto } from './dto/admin-response.dto';
import { CurrentAdmin, SuperAdminOnly } from '../common/decorators';
import { Admin } from './entities/admin.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateMeAdminDto } from './dto/update-me-admin.dto';
import { JwtAuthAdminGuard } from '../admins-auth/guards/jwt-auth-admin.guard';
import { TranslationKeys } from '../i18n/translation-keys';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { createParseFilePipe } from '../file-manager/validator/files-validation-factory';
import { AllowedTypes } from '../file-manager/constants/file.constants';
import { MulterFile } from '../file-manager/types/file.types';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { PaginationParams } from '../common/pagination/pagination-params.decorator';
import {
  Sorting,
  SortingParams,
} from '../common/pagination/sort-params.decorator';

@Controller('admins')
@UseGuards(JwtAuthAdminGuard, RolesGuard)
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly responseService: ResponseService,
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover_image', maxCount: 1 },
      { name: 'profile_image', maxCount: 1 },
    ]),
  )
  async updateMe(
    @UploadedFiles(
      createParseFilePipe({
        fields: {
          cover_image: {
            allowedTypes: AllowedTypes.images,
          },
          profile_image: {
            allowedTypes: AllowedTypes.images,
          },
        },
      }),
    )
    files: {
      cover_image?: MulterFile[];
      profile_image?: MulterFile[];
    },
    @CurrentAdmin() admin: Admin,
    @Body() updateMeAdminDto: UpdateMeAdminDto,
  ) {
    const updatedAdmin = await this.adminsService.update(admin.id, {
      ...updateMeAdminDto,
      cover_image: files?.cover_image?.[0] || null,
      profile_image: files?.profile_image?.[0] || null,
    });
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_me),
      {
        admin: transformToDto(AdminResponseDto, updatedAdmin),
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
  @Get()
  async findAll(
    @PaginationParams() paginationDto: PaginationDto,
    @SortingParams(['full_name', 'username', 'email', 'roles'])
    sorting: Sorting,
  ) {
    const result = await this.adminsService.findAll({
      paginationDto,
      sorting,
    });
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admins_retrieved),
      result,
    );
  }

  @Get('me')
  async me(@CurrentAdmin() admin: Admin) {
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.admin_me),
      {
        admin: transformToDto(AdminResponseDto, admin),
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
