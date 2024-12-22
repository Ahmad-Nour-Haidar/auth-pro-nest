import { IsOptional } from 'class-validator';
import { AnyOf } from '../../common/validations/any-of';
import {
  IsValidCode6,
  IsValidEmail,
  IsValidUsername,
} from '../../common/validations/custom-validations';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

@AnyOf(['email', 'username'], {
  message: i18nValidationMessage(TranslationKeys.email_or_username_required),
})
export class VerifyCodeDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;

  @IsValidCode6()
  readonly code: string;
}
