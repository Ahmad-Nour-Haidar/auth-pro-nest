import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminsAuthService } from '../admins-auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(
  Strategy,
  'admin-local',
) {
  constructor(private readonly adminsAuthService: AdminsAuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const admin = await this.adminsAuthService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
    return admin;
  }
}
