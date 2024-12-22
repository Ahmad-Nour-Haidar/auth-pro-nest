import { IsDefined, IsOptional } from 'class-validator';
import { Roles } from '../enums/roles.enum';
import { Match } from '../../common/decorators/match.decorator';
import {
  IsValidEmail,
  IsValidFullName,
  IsValidPassword,
  IsValidRoles,
  IsValidUsername,
} from '../../common/validations/custom-validations';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

export class CreateAdminDto {
  @IsValidEmail()
  email: string;

  @IsValidUsername()
  username: string;

  @IsOptional()
  @IsValidFullName()
  readonly full_name?: string;

  @IsValidPassword()
  password: string;

  @IsDefined({
    message: i18nValidationMessage(TranslationKeys.confirm_password_required),
  })
  @Match('password', {
    message: i18nValidationMessage(TranslationKeys.passwords_not_match),
  })
  confirm_password: string;

  @IsValidRoles({
    enumType: Roles,
    excludedRoles: [Roles.superAdmin, Roles.user],
  })
  readonly roles: Roles[];
}
