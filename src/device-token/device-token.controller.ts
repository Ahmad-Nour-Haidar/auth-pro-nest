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
import { CurrentEntityType, CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';
import { EntityTypeEnum } from '../common/enums/entity-type.enum';
import { Admin } from '../admins/entities/admin.entity';
import { ResponseService } from '../common/services/response.service';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('device-token')
export class DeviceTokenController {
  constructor(
    private readonly deviceTokenService: DeviceTokenService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async setForUser(
    @Body() dto: SetDeviceTokenAndLanguageDto,
    @CurrentUser() entity: User | Admin,
    @CurrentEntityType() entityType: EntityTypeEnum,
  ) {
    await this.deviceTokenService.set({
      entity_id: entity.id,
      entity_type: entityType,
      ...dto,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteForUser(@CurrentUser() entity: User | Admin) {
    await this.deviceTokenService.deleteByEntityId({
      entity_id: entity.id,
    });
    return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  }

  // @Post('admins')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthAdminGuard)
  // async setForAdmins(
  //   @Body() setDeviceTokenAndLanguageDto: SetDeviceTokenAndLanguageDto,
  //   @CurrentAdmin() admin: Admin,
  // ) {
  //   await this.deviceTokenService.set({
  //     entity_id: admin.id,
  //     entity_type: EntityTypeEnum.admin,
  //     ...setDeviceTokenAndLanguageDto,
  //   });
  //   return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  // }
  //
  // @Delete('admins')
  // @UseGuards(JwtAuthAdminGuard)
  // async deleteForAdmins(@CurrentAdmin() admin: Admin) {
  //   await this.deviceTokenService.deleteByEntityId({
  //     entity_id: admin.id,
  //   });
  //   return this.responseService.success(this.i18n.tr(TranslationKeys.success));
  // }
}
