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
    86400: 259200, // 1 day -> 3 days
    259200: 604800, // 3 days -> 7 days
    604800: 1209600, // 7 days -> 14 days
    1209600: 1814400, // 14 days -> 21 days
    1814400: 2419200, // 21 days -> 28 days
  };

  private calculateTimeDifference(from: number, to: number): string {
    const differenceInSeconds = to - from;

    if (differenceInSeconds < 3600) {
      const minutes = Math.ceil(differenceInSeconds / 60);
      return `${minutes} minute(s)`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.ceil(differenceInSeconds / 3600);
      return `${hours} hour(s)`;
    } else {
      const days = Math.ceil(differenceInSeconds / 86400);
      return `${days} day(s)`;
    }
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
        const timeDifference = this.calculateTimeDifference(now, allowedTime);
        throw new BadRequestException(
          `You can get the verification code after ${timeDifference}.`,
        );
      }
    }

    // Assign the next interval or initialize to the default
    if (
      !interval_to_send_verify_code ||
      !this.nextIntervals.hasOwnProperty(interval_to_send_verify_code)
    ) {
      interval_to_send_verify_code = Number(Object.keys(this.nextIntervals)[0]); // Default interval
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
          'The verification code has expired. Please request a new one.',
        );
      }
      throw new BadRequestException('Invalid verification code.');
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
