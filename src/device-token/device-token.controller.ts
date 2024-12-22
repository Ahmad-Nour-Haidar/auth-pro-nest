import {
  Body,
  Controller,
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

@Controller('device-token')
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post('users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  setForUser(
    @Body() setDeviceTokenAndLanguageDto: SetDeviceTokenAndLanguageDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceTokenService.set({
      entity_id: user.id,
      user_type: EntityTypeEnum.user,
      ...setDeviceTokenAndLanguageDto,
    });
  }

  @Post('admins')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  setForAdmins(
    @Body() setDeviceTokenAndLanguageDto: SetDeviceTokenAndLanguageDto,
    @CurrentAdmin() admin: Admin,
  ) {
    return this.deviceTokenService.set({
      entity_id: admin.id,
      user_type: EntityTypeEnum.admin,
      ...setDeviceTokenAndLanguageDto,
    });
  }
}
