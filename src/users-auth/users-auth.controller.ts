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
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UsersService } from '../users/users.service';
import { LodashService } from '../common/services/lodash.service';

@Controller('users-auth')
export class UsersAuthController {
  constructor(
    private readonly usersAuthService: UsersAuthService,
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
    private readonly lodashService: LodashService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersAuthService.register(registerUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.registration_successful),
      {
        user: transformToDto(UserAuthResponseDto, user),
      },
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    const result = await this.usersAuthService.login(loginDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.login_success),
      result,
    );
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    const result = await this.usersAuthService.loginWithOtp(loginWithOtpDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.otp_login_success),
      result,
    );
  }

  @Post('google-sign-in')
  @HttpCode(HttpStatus.OK)
  async googleSignIn(@Body() googleSignInDto: GoogleSignInDto) {
    const result = await this.usersAuthService.googleSignIn(googleSignInDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.google_sign_in_successful),
      {
        result,
      },
    );
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    await this.usersAuthService.checkEmail(checkEmailDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.verification_code_sent),
    );
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.usersAuthService.verifyCode(verifyCodeDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.code_verified),
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersAuthService.resetPassword(resetPasswordDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.password_reset),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    await this.usersAuthService.changePassword(user, changePasswordDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.password_changed),
    );
  }

  @Patch('enable-2fa')
  @UseGuards(JwtAuthUserGuard)
  async enable2fa(@CurrentUser() user: User) {
    const result = await this.usersAuthService.enable2fa(user);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_enabled),
      { user: transformToDto(UserAuthResponseDto, result) },
    );
  }

  @Patch('verify-2fa')
  @UseGuards(JwtAuthUserGuard)
  async verify2fa(@CurrentUser() user: User, @Body() otpCodeDto: OtpCodeDto) {
    const result = await this.usersAuthService.verify2fa(user, otpCodeDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_verified),
      {
        user: transformToDto(UserAuthResponseDto, result),
      },
    );
  }

  @Patch('disable-2fa')
  @UseGuards(JwtAuthUserGuard)
  async disable2fa(@CurrentUser() user: User) {
    const result = await this.usersAuthService.disable2fa(user);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.two_factor_disabled),
      {
        user: transformToDto(UserAuthResponseDto, result),
      },
    );
  }

  @Get('me')
  @UseGuards(JwtAuthUserGuard)
  async me(@CurrentUser() user: User) {
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_retrieved),
      {
        user: this.lodashService.omitKeys(user, [
          'password',
          'password_changed_at',
          'verify_code',
          'roles',
        ]),
      },
    );
  }

  @Patch('me')
  @UseGuards(JwtAuthUserGuard)
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.account_updated),
      {
        user: this.lodashService.omitKeys(updatedUser, [
          'password',
          'password_changed_at',
          'verify_code',
          'roles',
        ]),
      },
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthUserGuard)
  async logout(@CurrentUser() user: User) {
    await this.usersAuthService.logout(user);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.logged_out_successfully),
    );
  }
}
