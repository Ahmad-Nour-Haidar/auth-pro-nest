import { IsNotEmpty, IsString } from 'class-validator';
import {
  IsValidConfirmPassword,
  IsValidPassword,
} from '../../common/validations/custom-validations';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

export class ChangePasswordDto {
  @IsNotEmpty({
    message: i18nValidationMessage(TranslationKeys.old_password_required),
  })
  @IsString({
    message: i18nValidationMessage(TranslationKeys.old_password_string),
  })
  old_password: string;

  @IsValidPassword()
  password: string;

  @IsValidConfirmPassword()
  confirm_password: string;
}
