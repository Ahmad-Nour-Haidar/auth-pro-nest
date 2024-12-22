import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Languages } from '../enums/languages.enum';
import { AnyOf } from '../../common/validations/any-of';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

@AnyOf(['firebase_device_token', 'language'], {
  message: i18nValidationMessage(
    TranslationKeys.language_or_device_token_required,
  ),
})
export class SetDeviceTokenAndLanguageDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @IsOptional()
  readonly firebase_device_token: string;

  @IsEnum(Languages)
  @IsNotEmpty()
  @IsOptional()
  readonly lang: Languages;
}
