import { Injectable } from '@nestjs/common';
import { CustomI18nService } from './common/services/custom-i18n.service';

@Injectable()
export class AppService {
  constructor(private readonly i18n: CustomI18nService) {}

  getHello(): string {
    return this.i18n.tr('hello', { args: { name: 'ahmad' } });
  }
}
