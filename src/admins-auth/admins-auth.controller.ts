import {
  Body,
  Controller,
  Get,
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
import { transformToDto } from '../utilities/transform.util';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';

@Controller('admins-auth')
export class AdminsAuthController {
  constructor(
    private readonly adminsAuthService: AdminsAuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginAdminDto) {
    const result = await this.adminsAuthService.login(loginDto);
    return this.responseService.success('msg', result);
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    await this.adminsAuthService.checkEmail(checkEmailDto);
    return this.responseService.success(
      'msg email check success and we sent verify code ',
    );
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.adminsAuthService.verifyCode(verifyCodeDto);
    return this.responseService.success('verified success');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.adminsAuthService.resetPassword(resetPasswordDto);
    return this.responseService.success('msg');
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentAdmin() admin: Admin,
  ) {
    await this.adminsAuthService.changePassword(admin, changePasswordDto);
    return this.responseService.success('msg');
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthAdminGuard)
  async enable(@CurrentAdmin() admin: Admin) {
    const result = await this.adminsAuthService.enable2fa(admin);
    return this.responseService.success(
      '2FA enabled successfully, please go and verify your Authenticator App',
      { admin: transformToDto(AdminAuthResponseDto, result) },
    );
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async verify2fa(
    @CurrentAdmin() admin: Admin,
    @Body() otpCodeDto: OtpCodeDto,
  ) {
    const result = await this.adminsAuthService.verify2fa(admin, otpCodeDto);
    return this.responseService.success('2FA verified successfully', {
      admin: transformToDto(AdminAuthResponseDto, result),
    });
  }

  @Patch('disable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthAdminGuard)
  async disable2fa(@CurrentAdmin() admin: Admin) {
    const result = await this.adminsAuthService.disable2fa(admin);
    return this.responseService.success('2FA disabled successfully', {
      admin: transformToDto(AdminAuthResponseDto, result),
    });
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    const result = await this.adminsAuthService.loginWithOtp(loginWithOtpDto);
    return this.responseService.success('2FA disabled successfully', result);
  }
}
