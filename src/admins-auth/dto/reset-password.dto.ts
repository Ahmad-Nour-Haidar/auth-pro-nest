import { IsOptional } from 'class-validator';
import {
  IsValidCode6,
  IsValidConfirmPassword,
  IsValidEmail,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';
import { AnyOf } from '../../common/validations/any-of';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

@AnyOf(['email', 'username'], {
  message: i18nValidationMessage(TranslationKeys.email_or_username_required),
})
export class ResetPasswordDto {
  @IsValidEmail()
  @IsOptional()
  readonly email?: string;

  @IsValidUsername()
  @IsOptional()
  readonly username?: string;

  @IsValidPassword()
  password: string;

  @IsValidConfirmPassword()
  readonly confirm_password: string;

  @IsValidCode6()
  readonly code: string;
}
