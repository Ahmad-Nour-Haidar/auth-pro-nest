import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseService } from '../common/services/response.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminsAuthService } from './admins-auth.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentAdmin } from '../common/decorators';
import { Admin } from '../admins/entities/admin.entity';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';
import { JwtAuthAdminGuard } from './guards/jwt-auth-admin.guard';
import { transformToDto } from '../common/util/transform.util';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';

@Controller('admins-auth')
export class AdminsAuthController {
  constructor(
    private readonly adminsAuthService: AdminsAuthService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginAdminDto) {
    const result = await this.adminsAuthService.login(loginDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.login_success),
      result,
    );
  }

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  async sendCode(@Body() checkEmailDto: CheckEmailDto) {
    await this.adminsAuthService.sendCode(checkEmailDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.verification_code_sent),
    );
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.adminsAuthService.verifyCode(verifyCodeDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.code_verified),
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.adminsAuthService.resetPassword(resetPasswordDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.password_reset),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentAdmin() admin: Admin,
  ) {
    await this.adminsAuthService.changePassword(admin, changePasswordDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.password_changed),
    );
  }

  @Patch('enable-2fa')
  @UseGuards(JwtAuthAdminGuard)
  async enable(@CurrentAdmin() admin: Admin) {
    const result = await this.adminsAuthService.enable2fa(admin);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_enabled),
      { admin: transformToDto(AdminAuthResponseDto, result) },
    );
  }

  @Patch('verify-2fa')
  @UseGuards(JwtAuthAdminGuard)
  async verify2fa(
    @CurrentAdmin() admin: Admin,
    @Body() otpCodeDto: OtpCodeDto,
  ) {
    const result = await this.adminsAuthService.verify2fa(admin, otpCodeDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_verified),
      {
        admin: transformToDto(AdminAuthResponseDto, result),
      },
    );
  }

  @Patch('disable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async disable2fa(@CurrentAdmin() admin: Admin) {
    const result = await this.adminsAuthService.disable2fa(admin);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_disabled),
      {
        admin: transformToDto(AdminAuthResponseDto, result),
      },
    );
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    const result = await this.adminsAuthService.loginWithOtp(loginWithOtpDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.otp_login_success),
      result,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async logout(@CurrentAdmin() admin: Admin) {
    await this.adminsAuthService.logout(admin);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.logged_out_successfully),
    );
  }
}
