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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentAdmin } from '../common/decorators';
import { Admin } from '../admins/entities/admin.entity';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';

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
    return this.responseService.success('msg verify code sent');
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.adminsAuthService.verifyCode(verifyCodeDto);
    return this.responseService.success('msg');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.adminsAuthService.resetPassword(resetPasswordDto);
    return this.responseService.success('msg');
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentAdmin() admin: Admin,
  ) {
    await this.adminsAuthService.changePassword(admin, changePasswordDto);
    return this.responseService.success('msg');
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  async enable(@CurrentAdmin() admin: Admin) {
    const result = await this.adminsAuthService.enable2fa(admin);
    return this.responseService.success(
      '2FA enabled successfully, please go and verify your Authenticator App',
      { result },
    );
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async verify2fa(
    @CurrentAdmin() admin: Admin,
    @Body() otpCodeDto: OtpCodeDto,
  ) {
    await this.adminsAuthService.verify2fa(admin, otpCodeDto);
    return this.responseService.success('2FA verified successfully');
  }

  @Patch('disable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async disable2fa(@CurrentAdmin() admin: Admin) {
    await this.adminsAuthService.disable2fa(admin);
    return this.responseService.success('2FA disabled successfully');
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    const result = await this.adminsAuthService.loginWithOtp(loginWithOtpDto);
    return this.responseService.success('2FA disabled successfully', result);
  }
}
