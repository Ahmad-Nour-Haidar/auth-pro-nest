import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { SetDeviceTokenAndLanguageDto } from './dto/set-device-token-and-language.dto';
import { JwtAuthUserGuard } from '../users-auth/guards/jwt-auth-user.guard';
import { CurrentAdmin, CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';
import { EntityTypeEnum } from './enums/entity-type.enum';
import { Admin } from '../admins/entities/admin.entity';
import { JwtAuthAdminGuard } from '../admins-auth/guards/jwt-auth-admin.guard';
import { ResponseService } from '../common/services/response.service';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';

@Controller('device-token')
export class DeviceTokenController {
  constructor(
    private readonly deviceTokenService: DeviceTokenService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post('users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async setForUser(
    @Body() setDeviceTokenAndLanguageDto: SetDeviceTokenAndLanguageDto,
    @CurrentUser() user: User,
  ) {
    await this.deviceTokenService.set({
      entity_id: user.id,
      entity_type: EntityTypeEnum.user,
      ...setDeviceTokenAndLanguageDto,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }

  @Delete('users')
  @UseGuards(JwtAuthUserGuard)
  async deleteForUser(@CurrentUser() user: User) {
    await this.deviceTokenService.deleteByEntityId({
      entity_id: user.id,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }

  @Post('admins')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async setForAdmins(
    @Body() setDeviceTokenAndLanguageDto: SetDeviceTokenAndLanguageDto,
    @CurrentAdmin() admin: Admin,
  ) {
    await this.deviceTokenService.set({
      entity_id: admin.id,
      entity_type: EntityTypeEnum.admin,
      ...setDeviceTokenAndLanguageDto,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }

  @Delete('admins')
  @UseGuards(JwtAuthAdminGuard)
  async deleteForAdmins(@CurrentAdmin() admin: Admin) {
    await this.deviceTokenService.deleteByEntityId({
      entity_id: admin.id,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }
}
