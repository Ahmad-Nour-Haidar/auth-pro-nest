import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { AdminResponseDto } from '../admins/dto/admin-response.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { MailService } from '../common/services/mail.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorAuthService } from '../common/services/two-factor-auth.service';
import { OtpCodeDto } from '../common/dto/otp-code.dto';
import { LoginWithOtpDto } from '../common/dto/login-with-otp.dto';

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
    const { email, password } = loginDto;

    const admin = await this.adminsRepository.findOneBy({ email });

    if (
      !admin ||
      !(await this.bcryptService.compare(password, admin.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (admin.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (!admin.verified_at) {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      admin.verify_code = verifyCode;
      await this.adminsRepository.save(admin);

      // Send the verification code via email
      await this.mailService.sendMail({
        username: admin.username,
        to: admin.email,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${verifyCode}`,
      });
      throw new ForbiddenException(
        'This account has not been verified, we are sent the verify code.',
      );
    }

    if (admin.two_fa_enabled_at && admin.two_factor_secret) {
      throw new BadRequestException(
        'Two-Factor Authentication is enabled. You must log in with your OTP code.',
      );
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminResponseDto, admin) };
  }

  async checkEmail(checkEmailDto: CheckEmailDto): Promise<void> {
    const admin = await this.adminsRepository.findOneBy({
      email: checkEmailDto.email,
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

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    admin.verify_code = verifyCode;
    admin.verified_at = null;

    await this.adminsRepository.save(admin);

    // Send the verification code via email
    await this.mailService.sendMail({
      username: admin.username,
      to: admin.email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${verifyCode}`,
    });
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;

    const admin = await this.adminsRepository.findOneBy({ email });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (admin.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (admin.verify_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    admin.verified_at = new Date();

    admin.verify_code = null;

    await this.adminsRepository.save(admin);
    return { admin };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { code, email, password } = resetPasswordDto;
    const admin = await this.adminsRepository.findOneBy({ email });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (admin.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

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

    await this.adminsRepository.save(admin);
    return { admin };
  }

  async changePassword(
    admin: Admin,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const isMatch = await this.bcryptService.compare(
      changePasswordDto.old_password,
      admin.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    admin.password = await this.bcryptService.hash(changePasswordDto.password);
    admin.password_changed_at = new Date();

    await this.adminsRepository.save(admin);
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminsRepository.findOneBy({ email });
    if (admin && (await this.bcryptService.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null; // Return null if authentication fails
  }

  async enable2fa(admin: Admin): Promise<any> {
    if (admin.two_fa_enabled_at && admin.two_factor_secret) {
      // 2FA is already enabled
      throw new ConflictException(
        'Two-factor authentication is already enabled. If you want to reset it, please disable it first.',
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(admin.email);

    admin.two_fa_enabled_at = new Date();
    admin.two_factor_secret = secret.base32;

    await this.adminsRepository.save(admin);

    const generateQRCode = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );
    return {
      secret: secret.base32,
      qr_code_image_url: generateQRCode,
    };
  }

  async verify2fa(admin: Admin, otpCodeDto: OtpCodeDto): Promise<void> {
    if (!admin.two_fa_enabled_at || !admin.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete. Please complete the setup or contact support.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }
  }

  async disable2fa(admin: Admin): Promise<Admin> {
    if (!admin.two_fa_enabled_at || !admin.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete or already disabled.',
      );
    }

    await this.adminsRepository.update(
      { id: admin.id },
      { two_factor_secret: null, two_fa_enabled_at: null },
    );
    admin.two_factor_secret = null;
    admin.two_fa_enabled_at = null;
    return admin;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const admin = await this.adminsRepository.findOneBy({
      email: loginWithOtpDto.email,
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

    if (!admin.two_fa_enabled_at || !admin.two_factor_secret) {
      // 2FA setup is incomplete
      throw new BadRequestException(
        'Two-factor authentication setup is incomplete. Please complete the setup or contact support.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      admin.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    if (!admin.verified_at) {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      admin.verify_code = verifyCode;
      await this.adminsRepository.save(admin);

      // Send the verification code via email
      await this.mailService.sendMail({
        username: admin.username,
        to: admin.email,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${verifyCode}`,
      });
      throw new ForbiddenException(
        'This account has not been verified, we are sent the verify code.',
      );
    }

    admin.last_login_at = new Date();

    await this.adminsRepository.save(admin);

    const payload: JwtSignPayload = { id: admin.id, roles: admin.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, admin: transformToDto(AdminResponseDto, admin) };
  }
}
