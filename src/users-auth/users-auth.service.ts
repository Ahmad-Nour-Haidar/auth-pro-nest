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
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Roles } from '../admins/enums/roles.enum';
import { UsersService } from '../users/users.service';
import { CreateMethod } from '../users/enums/create-method.enum';
import { RegisterUserDto } from './dto/register-user.dto';

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
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Check if the email or username already exists
    await this.usersService.checkForExistingUser(registerUserDto);

    // Hash the password
    registerUserDto.password = await this.bcryptService.hash(
      registerUserDto.password,
    );

    const verifyCode = this.mailService.getVerifyCode();

    const user = this.usersRepository.create({
      ...registerUserDto,
      create_method: CreateMethod.localEmail,
      verify_code: verifyCode,
      roles: [Roles.user],
    });

    await this.mailService.sendMail({
      username: user.username,
      to: user.email,
      subject: 'Verification Code',
      text: `Your verification code is: ${verifyCode}`,
    });

    return this.usersRepository.save(user);
  }

  async login(loginDto: LoginUserDto) {
    const { email, password, username } = loginDto;

    const user = await this.usersRepository.findOne({
      where: [{ email }, { username }], // where - orWhere
    });
    if (!user || !(await this.bcryptService.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (user.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (!user.verify_code) {
      user.verify_code = this.mailService.getVerifyCode();
      await this.usersRepository.save(user);

      // Send the verification code via email
      await this.mailService.sendMail({
        username: user.username,
        to: user.email,
        subject: 'Verification Code',
        text: `Your verification code is: ${user.verify_code}`,
      });
      throw new ForbiddenException(
        'This account has not been verified, we are sent the verify code.',
      );
    }

    if (user.two_fa_enabled_at && user.two_factor_secret) {
      throw new HttpException(
        'Login successful. Two-Factor Authentication is enabled. Please log in using your OTP code.',
        HttpStatus.ACCEPTED,
      );
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserResponseDto, user) };
  }

  async checkEmail(checkEmailDto: CheckEmailDto): Promise<void> {
    const user = await this.usersRepository.findOneBy({
      email: checkEmailDto.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (user.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    user.verify_code = this.mailService.getVerifyCode();
    user.verified_at = null;

    await this.usersRepository.save(user);

    // Send the verification code via email
    await this.mailService.sendMail({
      username: user.username,
      to: user.email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${user.verify_code}`,
    });
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;

    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (user.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (user.verify_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.verified_at = new Date();

    user.verify_code = null;

    await this.usersRepository.save(user);
    return { user };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { code, email, password } = resetPasswordDto;
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (user.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (user.verify_code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Hash the password
    user.password = await this.bcryptService.hash(password);
    user.password_changed_at = new Date();
    user.verify_code = null;
    if (!user.verified_at) {
      user.verified_at = new Date();
    }

    await this.usersRepository.save(user);
    return { user };
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const isMatch = await this.bcryptService.compare(
      changePasswordDto.old_password,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = await this.bcryptService.hash(changePasswordDto.password);
    user.password_changed_at = new Date();

    await this.usersRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await this.bcryptService.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null; // Return null if authentication fails
  }

  async enable2fa(user: User): Promise<any> {
    if (user.two_fa_enabled_at && user.two_factor_secret) {
      // 2FA is already enabled
      throw new ConflictException(
        'Two-factor authentication is already enabled. If you want to reset it, please disable it first.',
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(user.email);

    user.two_fa_enabled_at = new Date();
    user.two_factor_secret = secret.base32;

    await this.usersRepository.save(user);

    const generateQRCode = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );
    return {
      secret: secret.base32,
      qr_code_image_url: generateQRCode,
    };
  }

  async verify2fa(user: User, otpCodeDto: OtpCodeDto): Promise<void> {
    if (!user.two_fa_enabled_at || !user.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete. Please complete the setup or contact support.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }
  }

  async disable2fa(user: User): Promise<User> {
    if (!user.two_fa_enabled_at || !user.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete or already disabled.',
      );
    }

    await this.usersRepository.update(
      { id: user.id },
      { two_factor_secret: null, two_fa_enabled_at: null },
    );
    user.two_factor_secret = null;
    user.two_fa_enabled_at = null;
    return user;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const user = await this.usersRepository.findOneBy({
      email: loginWithOtpDto.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This account has been deleted.');
    }

    if (user.blocked_at) {
      throw new ForbiddenException('This account has been blocked.');
    }

    if (!user.two_fa_enabled_at || !user.two_factor_secret) {
      // 2FA setup is incomplete
      throw new BadRequestException(
        'Two-factor authentication setup is incomplete. Please complete the setup or contact support.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    if (!user.verified_at) {
      user.verify_code = this.mailService.getVerifyCode();
      await this.usersRepository.save(user);

      // Send the verification code via email
      await this.mailService.sendMail({
        username: user.username,
        to: user.email,
        subject: 'Password Reset Verification Code',
        text: `Your verification code is: ${user.verify_code}`,
      });
      throw new ForbiddenException(
        'This account has not been verified, we are sent the verify code.',
      );
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserResponseDto, user) };
  }
}
