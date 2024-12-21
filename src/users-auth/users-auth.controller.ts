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
import { LoginUserDto } from './dto/login-user.dto';
import { UsersAuthService } from './users-auth.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../common/decorators';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';
import { User } from '../users/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { transformToDto } from '../utilities/transform.util';
import { UserAuthResponseDto } from './dto/user-auth-response.dto';
import { JwtAuthUserGuard } from './guards/jwt-auth-user.guard';

// import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('users-auth')
export class UsersAuthController {
  constructor(
    private readonly usersAuthService: UsersAuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersAuthService.register(registerUserDto);
    return this.responseService.success('msg', {
      user: transformToDto(UserAuthResponseDto, user),
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    const result = await this.usersAuthService.login(loginDto);
    return this.responseService.success('msg', result);
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    await this.usersAuthService.checkEmail(checkEmailDto);
    return this.responseService.success(
      'msg email check success and we sent verify code ',
    );
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.usersAuthService.verifyCode(verifyCodeDto);
    return this.responseService.success('verified success');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersAuthService.resetPassword(resetPasswordDto);
    return this.responseService.success('msg');
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    await this.usersAuthService.changePassword(user, changePasswordDto);
    return this.responseService.success('msg');
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthUserGuard)
  async enable2fa(@CurrentUser() user: User) {
    const result = await this.usersAuthService.enable2fa(user);
    return this.responseService.success(
      '2FA enabled successfully, please go and verify your Authenticator App',
      { user: transformToDto(UserAuthResponseDto, result) },
    );
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async verify2fa(@CurrentUser() user: User, @Body() otpCodeDto: OtpCodeDto) {
    const result = await this.usersAuthService.verify2fa(user, otpCodeDto);
    return this.responseService.success('2FA verified successfully', {
      user: transformToDto(UserAuthResponseDto, result),
    });
  }

  @Patch('disable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async disable2fa(@CurrentUser() user: User) {
    const result = await this.usersAuthService.disable2fa(user);
    return this.responseService.success('2FA disabled successfully', {
      user: transformToDto(UserAuthResponseDto, result),
    });
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    const result = await this.usersAuthService.loginWithOtp(loginWithOtpDto);
    return this.responseService.success('2FA disabled successfully', result);
  }
}
