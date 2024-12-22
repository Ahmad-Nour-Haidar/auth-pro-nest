import { Injectable, ForbiddenException } from '@nestjs/common';
import { CustomI18nService } from './custom-i18n.service';
import { TranslationKeys } from '../../i18n/translation-keys';

@Injectable()
export class JwtValidationService {
  constructor(private readonly i18n: CustomI18nService) {}

  validateEntity(entity: any, iat: number): void {
    if (!entity) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_found),
      );
    }

    if (entity.deleted_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_deleted),
      );
    }

    if (entity.blocked_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_blocked),
      );
    }

    if (!entity.verified_at) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.account_not_verified),
      );
    }

    this.validateTimestamps(entity, iat);
  }

  private validateTimestamps(
    entity: any,
    iat: number,
    // entityType: 'user' | 'admin',
  ): void {
    const passChangedTimestamp = entity.password_changed_at
      ? Math.floor(entity.password_changed_at.getTime() / 1000)
      : null;

    if (passChangedTimestamp && passChangedTimestamp > iat) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.password_recently_changed),
      );
    }

    const lastLoginTimestamp = entity.last_login_at
      ? Math.floor(entity.last_login_at.getTime() / 1000)
      : null;

    if (lastLoginTimestamp && lastLoginTimestamp > iat) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.logged_in_after_token_issued),
      );
    }

    const lastLogoutTimestamp = entity.last_logout_at
      ? Math.floor(entity.last_logout_at.getTime() / 1000)
      : null;

    if (lastLogoutTimestamp && lastLogoutTimestamp > iat) {
      throw new ForbiddenException(
        this.i18n.tr(TranslationKeys.logged_out_after_token_issued),
      );
    }
  }

  // private capitalize(str: string): string {
  //   return str.charAt(0).toUpperCase() + str.slice(1);
  // }
}
