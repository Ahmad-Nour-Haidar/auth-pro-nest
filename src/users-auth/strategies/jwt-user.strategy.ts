import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtValidationService } from '../../common/services/jwt-validation.service';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../common/types/jwt-payload.types';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly validationService: JwtValidationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id, iat } = payload;
    const user = await this.usersService.findOne(id);

    this.validationService.validateEntity(user, iat);
    return user;
  }
}
