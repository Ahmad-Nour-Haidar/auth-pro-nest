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
import { Roles } from '../admins/enums/roles.enum';
import { UsersService } from '../users/users.service';
import { CreateMethod } from '../users/enums/create-method.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserAuthResponseDto } from './dto/user-auth-response.dto';

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

    const user = await this.getUserByEmailOrUsername({
      email,
      username,
    });

    if (!(await this.bcryptService.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verified_at) {
      throw new ForbiddenException('This account has not been verified.');
    }

    if (user.two_factor_verified_at) {
      throw new HttpException(
        'Login successful. Two-Factor Authentication is enabled. Please log in using your OTP code.',
        HttpStatus.ACCEPTED,
      );
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserAuthResponseDto, user) };
  }

  async checkEmail(checkEmailDto: CheckEmailDto): Promise<User> {
    const user = await this.getUserByEmailOrUsername({
      email: checkEmailDto.email,
      username: checkEmailDto.username,
    });

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
    return user;
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<User> {
    const user = await this.getUserByEmailOrUsername({
      email: verifyCodeDto.email,
      username: verifyCodeDto.username,
    });

    if (user.verify_code !== verifyCodeDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.verified_at = new Date();

    user.verify_code = null;

    await this.usersRepository.save(user);
    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { code, email, password, username } = resetPasswordDto;
    const user = await this.getUserByEmailOrUsername({ email, username });

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
    return user;
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
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = await this.bcryptService.hash(changePasswordDto.password);
    user.password_changed_at = new Date();

    return this.usersRepository.save(user);
  }

  async enable2fa(user: User): Promise<User> {
    if (user.two_factor_verified_at) {
      throw new ConflictException(
        'Two-factor authentication is already enabled. If you want to reset it, please disable it first.',
      );
    }

    const secret = this.twoFactorAuthService.generateSecret(user.email);

    user.two_fa_enabled_at = new Date();
    user.two_factor_secret = secret.base32;
    user.qr_code_image_url = await this.twoFactorAuthService.generateQRCode(
      secret.otpauth_url,
    );

    return this.usersRepository.save(user);
  }

  async verify2fa(user: User, otpCodeDto: OtpCodeDto): Promise<User> {
    if (!user.two_fa_enabled_at || !user.two_factor_secret) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete. Disable and re-enable.',
      );
    }
    if (user.two_factor_verified_at) {
      throw new ConflictException(
        'Two-factor authentication is already verified.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      otpCodeDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    user.two_factor_verified_at = new Date();
    return this.usersRepository.save(user);
  }

  async disable2fa(user: User): Promise<User> {
    if (!user.two_factor_verified_at) {
      // 2FA setup is incomplete
      throw new ConflictException(
        'Two-factor authentication setup is incomplete or already disabled.',
      );
    }

    await this.usersRepository.update(
      { id: user.id },
      {
        two_factor_secret: null,
        two_fa_enabled_at: null,
        two_factor_verified_at: null,
        qr_code_image_url: null,
      },
    );
    user.two_factor_secret = null;
    user.two_fa_enabled_at = null;
    user.two_factor_verified_at = null;
    user.qr_code_image_url = null;
    return user;
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const user = await this.getUserByEmailOrUsername({
      email: loginWithOtpDto.email,
      username: loginWithOtpDto.username,
    });

    if (!user.verified_at) {
      throw new ForbiddenException(
        'This account is not verified. Please complete the verification process.',
      );
    }

    if (!user.two_factor_verified_at) {
      throw new BadRequestException(
        'Two-factor authentication (2FA) is not enabled for this account.',
      );
    }

    const isValid = this.twoFactorAuthService.validateCode(
      user.two_factor_secret,
      loginWithOtpDto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    user.last_login_at = new Date();

    await this.usersRepository.save(user);

    const payload: JwtSignPayload = { id: user.id, roles: user.roles };
    const token: string = this.jwtService.sign(payload);

    return { token, user: transformToDto(UserAuthResponseDto, user) };
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
      throw new UnauthorizedException('Email or username must be provided.');
    }

    const user = await this.usersRepository.findOne({
      where: [{ email }, { username }],
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

    return user;
  }
}
