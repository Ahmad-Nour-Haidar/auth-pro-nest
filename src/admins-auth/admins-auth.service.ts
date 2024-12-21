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
import { JwtSignPayload } from '../common/types/jwt-payload';
import { transformToDto } from '../utilities/transform.util';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { MailService } from '../common/services/mail.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorAuthService } from '../common/services/two-factor-auth.service';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';

@Injectable()
export class AdminsAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async login(loginDto: LoginAdminDto) {
    const { email, password, username } = loginDto;

    const admin = await this.getAdminByEmailOrUsername({
      email,
      username,
    });

    if (!(await this.bcryptService.compare(password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.verified_at) {
      throw new ForbiddenException('This account has not been verified.');
    }

    if (admin.two_factor_verified_at) {
      throw new HttpException(
        'Login successful. Two-Factor Authentication is enabled. Please log in using your OTP code.',
        HttpStatus.ACCEPTED,
      );
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminAuthResponseDto, admin) };
  }

  async checkEmail(checkEmailDto: CheckEmailDto): Promise<Admin> {
    const admin = await this.getAdminByEmailOrUsername({
      email: checkEmailDto.email,
      username: checkEmailDto.username,
    });

    admin.verify_code = this.mailService.getVerifyCode();
    admin.verified_at = null;

    await this.adminsRepository.save(admin);

    // Send the verification code via email
    await this.mailService.sendMail({
      username: admin.username,
      to: admin.email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${admin.verify_code}`,
    });

    return admin;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<Admin> {
    const admin = await this.getAdminByEmailOrUsername({
      email: verifyCodeDto.email,
      username: verifyCodeDto.username,
    });

    if (admin.verify_code !== verifyCodeDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    admin.verified_at = new Date();

    admin.verify_code = null;

    return this.adminsRepository.save(admin);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<Admin> {
    const { code, email, password, username } = resetPasswordDto;
    const admin = await this.getAdminByEmailOrUsername({ email, username });

    if (admin.verify_code !== code) {
      throw new BadRequestException('Invalid verification code');
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
      throw new BadRequestException('Old password is incorrect');
    }
    admin.password = await this.bcryptService.hash(changePasswordDto.password);
    admin.password_changed_at = new Date();

    return await this.adminsRepository.save(admin);
  }

  async enable2fa(admin: Admin): Promise<Admin> {
    if (admin.two_factor_verified_at) {
      throw new ConflictException(
        'Two-factor authentication is already enabled. If you want to reset it, please disable it first.',
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(admin.email);

    admin.two_fa_enabled_at = new Date();
    admin.two_factor_secret = secret.base32;
    admin.qr_code_image_url = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );

    return this.adminsRepository.save(admin);
  }

  async verify2fa(admin: Admin, otpCodeDto: OtpCodeDto): Promise<Admin> {
    if (!admin.two_fa_enabled_at || !admin.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete. Disable and re-enable.',
      );
    }
    if (admin.two_factor_verified_at) {
      throw new ConflictException(
        'Two-factor authentication is already verified.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    admin.two_factor_verified_at = new Date();
    return this.adminsRepository.save(admin);
  }

  async disable2fa(admin: Admin): Promise<Admin> {
    if (!admin.two_factor_verified_at) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete or already disabled.',
      );
    }

    await this.adminsRepository.update(
      { id: admin.id },
      {
        two_factor_secret: null,
        two_fa_enabled_at: null,
        two_factor_verified_at: null,
        qr_code_image_url: null,
      },
    );
    admin.two_factor_secret = null;
    admin.two_fa_enabled_at = null;
    admin.two_factor_verified_at = null;
    admin.qr_code_image_url = null;
    return admin;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const admin = await this.getAdminByEmailOrUsername({
      email: loginWithOtpDto.email,
      username: loginWithOtpDto.username,
    });

    if (!admin.verified_at) {
      throw new ForbiddenException(
        'This account is not verified. Please complete the verification process.',
      );
    }

    if (!admin.two_factor_verified_at) {
      throw new BadRequestException(
        'Two-factor authentication (2FA) is not enabled for this account.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminAuthResponseDto, admin) };
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
      throw new UnauthorizedException('Email or username must be provided.');
    }

    const admin = await this.adminsRepository.findOne({
      where: [{ email }, { username }],
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (admin.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    return admin;
  }
}
