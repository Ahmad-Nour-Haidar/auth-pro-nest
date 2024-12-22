import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AdminsService } from '../../admins/admins.service';
import { JwtValidationService } from '../../common/services/jwt-validation.service';
import { JwtPayload } from '../../common/types/jwt-payload';
import { Admin } from '../../admins/entities/admin.entity';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminsService: AdminsService,
    private readonly validationService: JwtValidationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<Admin> {
    const { id, iat } = payload;
    const admin = await this.adminsService.findOne(id);

    this.validationService.validateEntity(admin, iat);
    return admin;
  }
}
