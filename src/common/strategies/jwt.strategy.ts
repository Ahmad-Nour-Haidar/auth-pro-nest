import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from '../../admins/admins.service';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload';
import { isUser } from '../../admins/enums/roles.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminsService: AdminsService,
    private readonly usersService: UsersService,
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
      this.validateEntity(user, iat, 'user');
      console.log(user);
      return user; // Return validated user
    } else {
      const admin = await this.adminsService.findOne(id);
      this.validateEntity(admin, iat, 'admin');
      return admin; // Return validated admin
    }
  }

  /**
   * Validate common properties for both users and admins.
   * @param entity The user or admin entity.
   * @param iat Issued at timestamp from the token.
   * @param entityType Type of entity ('user' or 'admin').
   */
  private validateEntity(
    entity: any,
    iat: number,
    entityType: 'user' | 'admin',
  ) {
    if (!entity) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} does not exist.`,
      );
    }

    if (entity.deleted_at) {
      throw new ForbiddenException(
        `This ${entityType} account has been deleted.`,
      );
    }

    if (entity.blocked_at) {
      throw new ForbiddenException(
        `This ${entityType} account has been blocked.`,
      );
    }

    if (entityType === 'user' && !entity.verified_at) {
      throw new ForbiddenException('This user account has not been verified.');
    }

    this.validateTimestamps(entity, iat, entityType);
  }

  /**
   * Validate timestamps related to password changes, login, and logout.
   * @param entity The user or admin entity.
   * @param iat Issued at timestamp from the token.
   * @param entityType Type of entity ('user' or 'admin').
   */
  private validateTimestamps(
    entity: any,
    iat: number,
    entityType: 'user' | 'admin',
  ) {
    const passChangedTimestamp = entity.password_changed_at
      ? parseInt(String(entity.password_changed_at.getTime() / 1000), 10)
      : null;

    if (passChangedTimestamp && passChangedTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} recently changed their password. Please log in again.`,
      );
    }

    const lastLoginTimestamp = entity.last_login_at
      ? parseInt(String(entity.last_login_at.getTime() / 1000), 10)
      : null;

    if (lastLoginTimestamp && lastLoginTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} has logged in after the token was issued. Please log in again.`,
      );
    }

    const lastLogoutTimestamp = entity.last_logout_at
      ? parseInt(String(entity.last_logout_at.getTime() / 1000), 10)
      : null;

    if (lastLogoutTimestamp && lastLogoutTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} has logged out after the token was issued. Please log in again.`,
      );
    }
  }

  /**
   * Capitalize the first letter of a string.
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
