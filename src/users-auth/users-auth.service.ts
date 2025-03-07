import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { transformToDto } from '../common/util/transform.util';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { MailService } from '../common/services/mail.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorAuthService } from '../common/services/two-factor-auth.service';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';
import { User } from '../users/entities/user.entity';
import { Roles } from '../admins/enums/roles.enum';
import { UsersService } from '../users/users.service';
import { CreateMethod } from '../users/enums/create-method.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserAuthResponseDto } from './dto/user-auth-response.dto';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { GoogleAuthService } from './services/google-auth.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { JwtSignPayload } from '../common/types/jwt-payload.types';
import { VerifyCodeManagerService } from './services/verify-code-manager.service';
import { RandomService } from '../common/services/random.service';

@Injectable()
export class UsersAuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly randomService: RandomService,
    private readonly i18n: CustomI18nService,
    private readonly verifyCodeManagerService: VerifyCodeManagerService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Check if the email or username already exists
    await this.usersService.checkForExistingUser(registerUserDto);

    // Hash the password
    registerUserDto.password = await this.bcryptService.hash(
      registerUserDto.password,
    );

    // Generate a new verification code
    const { verifyCode, encryptedVerifyCode } =
      this.verifyCodeManagerService.getVerifyCode();

    let user = this.usersRepository.create({
      ...registerUserDto,
      create_method: CreateMethod.localEmail,
      verify_code: encryptedVerifyCode,
      roles: [Roles.user],
    });

    user = await this.usersRepository.save(user);

    await this.mailService.sendVerificationEmail(user, verifyCode);

    return user;
  }

  async login(loginDto: LoginUserDto) {
    const { email, password, username } = loginDto;

    const user = await this.getUserByEmailOrUsername({
      email,
      username,
    });

    if (user.create_method === CreateMethod.google && !user.password) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.google_linked_account),
      );
    }

    if (!(await this.bcryptService.compare(password, user.password))) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.invalid_credentials),
      );
    }

    if (!user.verified_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_verified),
      );
    }

    if (user.two_factor_verified_at) {
      throw new HttpException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_enabled),
        HttpStatus.ACCEPTED,
      );
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserAuthResponseDto, user) };
  }

  async sendCode(checkEmailDto: CheckEmailDto): Promise<User> {
    const user = await this.getUserByEmailOrUsername({
      email: checkEmailDto.email,
      username: checkEmailDto.username,
    });

    const { interval_to_send_verify_code, allowed_date_to_send_verify_code } =
      this.verifyCodeManagerService.canSendCode({
        interval_to_send_verify_code: user.interval_to_send_verify_code,
        allowed_date_to_send_verify_code: user.allowed_date_to_send_verify_code,
      });

    user.interval_to_send_verify_code = interval_to_send_verify_code;
    user.allowed_date_to_send_verify_code = allowed_date_to_send_verify_code;

    // Generate a new verification code
    const { verifyCode, encryptedVerifyCode } =
      this.verifyCodeManagerService.getVerifyCode();

    user.verify_code = encryptedVerifyCode;

    // Reset `verified_at` to null
    user.verified_at = null;

    // Send the verification code via email
    await this.mailService.sendVerificationEmail(user, verifyCode);

    // Save the updated user
    await this.usersRepository.save(user);

    return user;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<User> {
    const user = await this.getUserByEmailOrUsername({
      email: verifyCodeDto.email,
      username: verifyCodeDto.username,
    });

    const verifyCode = this.verifyCodeManagerService.verify(user.verify_code);

    if (verifyCode !== verifyCodeDto.code) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_verification_code),
      );
    }

    // Mark the user as verified
    user.verified_at = new Date();
    user.verify_code = null;

    return this.usersRepository.save(user);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { code, email, password, username } = resetPasswordDto;
    const user = await this.getUserByEmailOrUsername({ email, username });

    if (user.verify_code !== code) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_verification_code),
      );
    }

    // Hash the password
    user.password = await this.bcryptService.hash(password);
    user.password_changed_at = new Date();
    user.verify_code = null;
    if (!user.verified_at) {
      user.verified_at = new Date();
    }

    return this.usersRepository.save(user);
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const isMatch = await this.bcryptService.compare(
      changePasswordDto.old_password,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.old_password_incorrect),
      );
    }

    user.password = await this.bcryptService.hash(changePasswordDto.password);
    user.password_changed_at = new Date();

    return this.usersRepository.save(user);
  }

  async enable2fa(user: User): Promise<User> {
    if (user.two_factor_verified_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_already_enabled),
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(user.email);

    user.two_factor_enabled_at = new Date();
    user.two_factor_secret = secret.base32;
    user.two_factor_qr_code = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );

    return this.usersRepository.save(user);
  }

  async verify2fa(user: User, otpCodeDto: OtpCodeDto): Promise<User> {
    if (!user.two_factor_enabled_at || !user.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_incomplete),
      );
    }
    if (user.two_factor_verified_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_already_verified),
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_2fa_code),
      );
    }

    user.two_factor_verified_at = new Date();
    return this.usersRepository.save(user);
  }

  async disable2fa(user: User): Promise<User> {
    if (!user.two_factor_verified_at) {
      // 2FA setup is incomplete
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_disabled),
      );
    }

    await this.usersRepository.update(
      { id: user.id },
      {
        two_factor_secret: null,
        two_factor_enabled_at: null,
        two_factor_verified_at: null,
        two_factor_qr_code: null,
      },
    );
    user.two_factor_secret = null;
    user.two_factor_enabled_at = null;
    user.two_factor_verified_at = null;
    user.two_factor_qr_code = null;
    return user;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const user = await this.getUserByEmailOrUsername({
      email: loginWithOtpDto.email,
      username: loginWithOtpDto.username,
    });

    if (!user.verified_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_verified),
      );
    }

    if (!user.two_factor_verified_at) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.two_fa_not_enabled),
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_2fa_code),
      );
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserAuthResponseDto, user) };
  }

  async googleSignIn(googleSignInDto: GoogleSignInDto) {
    const tokenPayload = await this.googleAuthService.validateGoogleToken(
      googleSignInDto.idToken,
    );

    // Destructure the required information from the token payload
    const { email, name } = tokenPayload;

    // Check if the user already exists in the database
    let user = await this.usersRepository.findOneBy({ email });

    // If the user exists, treat it as a login
    if (user) {
      if (user.deleted_at) {
        throw new ForbiddenException(
          this.i18n.tr(TranslationKeys.account_deleted),
        );
      }

      if (user.blocked_at) {
        throw new ForbiddenException(
          this.i18n.tr(TranslationKeys.account_blocked),
        );
      }

      if (!user.verified_at) {
        throw new ForbiddenException(
          this.i18n.tr(TranslationKeys.account_not_verified),
        );
      }

      // Update last login timestamp
      user.last_login_at = new Date();
      await this.usersRepository.save(user);

      const payload: JwtSignPayload = { id: user.id, roles: user.roles };
      const token: string = this.jwtService.sign(payload);

      return {
        token,
        user: transformToDto(UserAuthResponseDto, user),
      };
    }

    // If the user does not exist, treat it as a first-time login (registration)
    let username = email.split('@')[0];

    while (await this.usersRepository.existsBy({ username })) {
      username = username + this.randomService.getRandomString(10);
    }
    user = this.usersRepository.create({
      email,
      username,
      full_name: name,
      verified_at: new Date(), // Automatically verify Google users
      create_method: CreateMethod.google,
      roles: [Roles.user],
    });

    user = await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return {
      token,
      user: transformToDto(UserAuthResponseDto, user),
    };
  }

  async logout(user: User) {
    user.last_logout_at = new Date();
    return this.usersRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await this.bcryptService.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null; // Return null if authentication fails
  }

  private async getUserByEmailOrUsername(identifier: {
    email?: string;
    username?: string;
  }): Promise<User> {
    const { email, username } = identifier;

    if (!email && !username) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.email_or_username_required),
      );
    }

    const user = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.invalid_credentials),
      );
    }

    if (user.deleted_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_deleted),
      );
    }

    if (user.blocked_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_blocked),
      );
    }

    return user;
  }
}
