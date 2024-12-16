import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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

@Controller('admins-auth')
export class AdminsAuthController {
  constructor(
    private readonly adminsAuthService: AdminsAuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginAdminDto) {
    const admin = await this.adminsAuthService.login(loginDto);
    return this.responseService.success('msg', admin);
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
}
