import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TranslateOptions } from 'nestjs-i18n/dist/services/i18n.service';

@Injectable()
export class CustomI18nService {
  constructor(private readonly i18n: I18nService) {}

  tr(key: string, options: TranslateOptions = {}): string {
    const lang = I18nContext.current().lang;
    // key = `translations.${key}`;
    return this.i18n.t(key, { lang, ...options });
  }
}
