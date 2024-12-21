import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class JwtValidationService {
  validateEntity(entity: any, iat: number, entityType: 'user' | 'admin'): void {
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

    if (!entity.verified_at) {
      throw new ForbiddenException(
        `This ${entityType} account has not been verified.`,
      );
    }

    this.validateTimestamps(entity, iat, entityType);
  }

  private validateTimestamps(
    entity: any,
    iat: number,
    entityType: 'user' | 'admin',
  ): void {
    const passChangedTimestamp = entity.password_changed_at
      ? Math.floor(entity.password_changed_at.getTime() / 1000)
      : null;

    if (passChangedTimestamp && passChangedTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} recently changed their password. Please log in again.`,
      );
    }

    const lastLoginTimestamp = entity.last_login_at
      ? Math.floor(entity.last_login_at.getTime() / 1000)
      : null;

    if (lastLoginTimestamp && lastLoginTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} has logged in after the token was issued. Please log in again.`,
      );
    }

    const lastLogoutTimestamp = entity.last_logout_at
      ? Math.floor(entity.last_logout_at.getTime() / 1000)
      : null;

    if (lastLogoutTimestamp && lastLogoutTimestamp > iat) {
      throw new ForbiddenException(
        `${this.capitalize(entityType)} has logged out after the token was issued. Please log in again.`,
      );
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
