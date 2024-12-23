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
import { enumToValuesString } from '../../utilities/enum-to-values-string.util';
import { Trim } from '../../common/decorators';

@AnyOf(['firebase_device_token', 'language'], {
  message: i18nValidationMessage(
    TranslationKeys.language_or_device_token_required,
  ),
})
export class SetDeviceTokenAndLanguageDto {
  @IsString({
    message: i18nValidationMessage(
      TranslationKeys.firebase_device_token_string,
    ),
  })
  @Length(1, 255, {
    message: i18nValidationMessage(
      TranslationKeys.firebase_device_token_length,
    ),
  })
  @Trim()
  @IsOptional()
  readonly firebase_device_token: string;

  @IsEnum(Languages, {
    message: i18nValidationMessage(TranslationKeys.lang_enum, {
      allowedValues: enumToValuesString(Languages),
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage(TranslationKeys.lang_not_empty),
  })
  @Trim()
  @IsOptional()
  readonly lang: Languages;
}
