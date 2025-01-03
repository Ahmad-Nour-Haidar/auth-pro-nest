import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RandomService } from '../../common/services/random.service';
import { ConfigService } from '@nestjs/config';

export interface CanSendCodeParams {
  interval_to_send_verify_code?: number;
  allowed_date_to_send_verify_code?: Date;
}

@Injectable()
export class VerifyCodeManagerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly randomService: RandomService,
    private readonly configService: ConfigService,
  ) {}

  // Define the next intervals in seconds
  private readonly nextIntervals: Record<number, number> = {
    300: 900, // 5 minutes -> 15 minutes
    900: 1800, // 15 minutes -> 30 minutes
    1800: 3600, // 30 minutes -> 1 hour
    3600: 10800, // 1 hour -> 3 hours
    10800: 21600, // 3 hours -> 6 hours
    21600: 43200, // 6 hours -> 12 hours
    43200: 86400, // 12 hours -> 24 hours
  };

  private calculateMinutesDifference(from: number, to: number): number {
    return Math.ceil((to - from) / 60);
  }

  canSendCode(canSendCodeParams: CanSendCodeParams) {
    let { interval_to_send_verify_code, allowed_date_to_send_verify_code } =
      canSendCodeParams;

    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    // Check if the user must wait before requesting a new code
    if (allowed_date_to_send_verify_code) {
      const allowedTime = Math.floor(
        new Date(allowed_date_to_send_verify_code).getTime() / 1000,
      );
      if (allowedTime > now) {
        const minutes = this.calculateMinutesDifference(now, allowedTime);
        throw new BadRequestException(
          `You can get the verification code after ${minutes} minutes.`,
        );
      }
    }

    // Assign the next interval or initialize to the default
    if (
      // !interval_to_send_verify_code ||
      !this.nextIntervals.hasOwnProperty(interval_to_send_verify_code)
    ) {
      interval_to_send_verify_code = Number.parseInt(
        Object.keys(this.nextIntervals)[0],
      );
    } else {
      interval_to_send_verify_code =
        this.nextIntervals[interval_to_send_verify_code];
    }

    // Calculate and set the next allowed date to send the verification code
    allowed_date_to_send_verify_code = new Date(
      (now + interval_to_send_verify_code) * 1000,
    );

    return { allowed_date_to_send_verify_code, interval_to_send_verify_code };
  }

  verify(jwtToken: string): string {
    try {
      const result = this.jwtService.verify(jwtToken);
      return result.verifyCode;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'The verification code was issued more than 5 minutes ago, Please try later!',
        );
      }
    }
  }

  getVerifyCode() {
    // Generate a new verification code
    const verifyCode = this.randomService.getRandomNumericString(6);

    // Sign the verification code as a JWT
    const encryptedVerifyCode = this.jwtService.sign(
      { verifyCode },
      { expiresIn: this.configService.get<number>('JWT_EXPIRE_TIME_CODE') },
    );
    return { verifyCode, encryptedVerifyCode };
  }
}
