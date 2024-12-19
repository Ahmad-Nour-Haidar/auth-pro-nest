import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  generateSecret(email: string) {
    return speakeasy.generateSecret({
      name: `ProFinder: ${email}`,
    });
  }

  async generateQRCode(secret: string): Promise<string> {
    return qrcode.toDataURL(secret);
  }

  validateCode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
  }
}
