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
import { Admin } from '../admins/entities/admin.entity';
import { BcryptService } from '../common/services/bcrypt.service';
import { LoginAdminDto } from './dto/login-admin.dto';
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
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';
import { RandomService } from '../common/services/random.service';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { JwtSignPayload } from '../common/types/jwt-payload.types';

@Injectable()
export class AdminsAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly randomService: RandomService,
    private readonly i18n: CustomI18nService,
  ) {}

  async login(loginDto: LoginAdminDto) {
    const { email, password, username } = loginDto;

    const admin = await this.getAdminByEmailOrUsername({
      email,
      username,
    });

    if (!(await this.bcryptService.compare(password, admin.password))) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.invalid_credentials),
      );
    }

    if (!admin.verified_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_verified),
      );
    }

    if (admin.two_factor_verified_at) {
      throw new HttpException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_enabled),
        HttpStatus.ACCEPTED,
      );
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminAuthResponseDto, admin) };
  }

  async sendCode(checkEmailDto: CheckEmailDto): Promise<Admin> {
    const admin = await this.getAdminByEmailOrUsername({
      email: checkEmailDto.email,
      username: checkEmailDto.username,
    });

    admin.verify_code = this.randomService.getRandomNumericString(6);
    admin.verified_at = null;

    await this.adminsRepository.save(admin);

    // Send the verification code via email
    await this.mailService.sendVerificationEmail(admin, admin.verify_code);

    return admin;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<Admin> {
    const admin = await this.getAdminByEmailOrUsername({
      email: verifyCodeDto.email,
      username: verifyCodeDto.username,
    });

    if (admin.verify_code !== verifyCodeDto.code) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_verification_code),
      );
    }

    admin.verified_at = new Date();

    admin.verify_code = null;

    return this.adminsRepository.save(admin);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<Admin> {
    const { code, email, password, username } = resetPasswordDto;
    const admin = await this.getAdminByEmailOrUsername({ email, username });

    if (admin.verify_code !== code) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_verification_code),
      );
    }

    // Hash the password
    admin.password = await this.bcryptService.hash(password);
    admin.password_changed_at = new Date();
    admin.verify_code = null;
    if (!admin.verified_at) {
      admin.verified_at = new Date();
    }

    return this.adminsRepository.save(admin);
  }

  async changePassword(
    admin: Admin,
    changePasswordDto: ChangePasswordDto,
  ): Promise<Admin> {
    const isMatch = await this.bcryptService.compare(
      changePasswordDto.old_password,
      admin.password,
    );

    if (!isMatch) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.old_password_incorrect),
      );
    }
    admin.password = await this.bcryptService.hash(changePasswordDto.password);
    admin.password_changed_at = new Date();

    return await this.adminsRepository.save(admin);
  }

  async enable2fa(admin: Admin): Promise<Admin> {
    if (admin.two_factor_verified_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_already_enabled),
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(admin.email);

    admin.two_factor_enabled_at = new Date();
    admin.two_factor_secret = secret.base32;
    admin.two_factor_qr_code = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );

    return this.adminsRepository.save(admin);
  }

  async verify2fa(admin: Admin, otpCodeDto: OtpCodeDto): Promise<Admin> {
    if (!admin.two_factor_enabled_at || !admin.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_incomplete),
      );
    }
    if (admin.two_factor_verified_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_already_verified),
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_2fa_code),
      );
    }

    admin.two_factor_verified_at = new Date();
    return this.adminsRepository.save(admin);
  }

  async disable2fa(admin: Admin): Promise<Admin> {
    if (!admin.two_factor_verified_at) {
      // 2FA setup is incomplete
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.two_factor_authentication_disabled),
      );
    }

    await this.adminsRepository.update(
      { id: admin.id },
      {
        two_factor_secret: null,
        two_factor_enabled_at: null,
        two_factor_verified_at: null,
        two_factor_qr_code: null,
      },
    );
    admin.two_factor_secret = null;
    admin.two_factor_enabled_at = null;
    admin.two_factor_verified_at = null;
    admin.two_factor_qr_code = null;
    return admin;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const admin = await this.getAdminByEmailOrUsername({
      email: loginWithOtpDto.email,
      username: loginWithOtpDto.username,
    });

    if (!admin.verified_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_verified),
      );
    }

    if (!admin.two_factor_verified_at) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.two_fa_not_enabled),
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException(
        this.i18n.tr(TranslationKeys.invalid_2fa_code),
      );
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminAuthResponseDto, admin) };
  }

  async logout(admin: Admin) {
    admin.last_logout_at = new Date();
    return this.adminsRepository.save(admin);
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminsRepository.findOneBy({ email });
    if (admin && (await this.bcryptService.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null; // Return null if authentication fails
  }

  private async getAdminByEmailOrUsername(identifier: {
    email?: string;
    username?: string;
  }): Promise<Admin> {
    const { email, username } = identifier;

    if (!email && !username) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.email_or_username_required),
      );
    }

    const admin = await this.adminsRepository.findOne({
      where: [{ email }, { username }],
    });

    if (!admin) {
      throw new UnauthorizedException(
        this.i18n.tr(TranslationKeys.invalid_credentials),
      );
    }

    if (admin.deleted_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_deleted),
      );
    }

    if (admin.blocked_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_blocked),
      );
    }

    return admin;
  }
}
