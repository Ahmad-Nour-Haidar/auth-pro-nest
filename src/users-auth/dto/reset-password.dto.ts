import { IsDefined, IsOptional } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';
import { AnyOf } from '../../common/validations/any-of';
import {
  IsValidCode6,
  IsValidEmail,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

@AnyOf(['email', 'username'], {
  message: i18nValidationMessage(TranslationKeys.email_or_username_required),
})
export class ResetPasswordDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;

  @IsValidPassword()
  password: string;

  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @IsValidCode6()
  readonly code: string;
}
