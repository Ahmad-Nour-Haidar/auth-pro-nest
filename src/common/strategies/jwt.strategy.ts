import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from '../../admins/admins.service';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload';
import { isUser } from '../../admins/enums/roles.enum';
import { JwtValidationService } from '../services/jwt-validation.service';
import { EntityTypeEnum } from '../../device-token/enums/entity-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminsService: AdminsService,
    private readonly usersService: UsersService,
    private readonly validationService: JwtValidationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { id, roles, iat } = payload;

    if (!roles || roles.length === 0) {
      throw new UnauthorizedException('Role is not valid.');
    }

    // Determine if user or admin based on roles
    if (isUser(roles)) {
      const user = await this.usersService.findOne(id);
      this.validationService.validateEntity(user, iat);
      return { ...user, entity_type: EntityTypeEnum.user }; // Return validated user
    } else {
      const admin = await this.adminsService.findOne(id);
      this.validationService.validateEntity(admin, iat);
      return { ...admin, entity_type: EntityTypeEnum.admin }; // Return validated admin
    }
  }
}
