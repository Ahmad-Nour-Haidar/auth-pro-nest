import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsEnum,
  ArrayNotContains,
  ArrayMinSize,
  IsArray,
  ValidationOptions,
  Length,
} from 'class-validator';
import { Roles } from '../../admins/enums/roles.enum';
import { applyDecorators } from '@nestjs/common';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TranslationKeys } from '../../i18n/translation-keys';

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsEmail(
      {},
      {
        message: i18nValidationMessage(TranslationKeys.email_invalid),
        ...validationOptions,
      },
    ),
    MaxLength(255, {
      message: i18nValidationMessage(TranslationKeys.email_too_long),
      ...validationOptions,
    }),
    IsString({
      message: i18nValidationMessage(TranslationKeys.email_not_string),
      ...validationOptions,
    }),
    IsNotEmpty({
      message: i18nValidationMessage(TranslationKeys.email_required),
      ...validationOptions,
    }),
  );
}

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(/^[a-zA-Z0-9]+$/, {
      message: i18nValidationMessage(
        TranslationKeys.username_invalid_characters,
      ),
      ...validationOptions,
    }),
    Length(3, 255, {
      message: i18nValidationMessage(TranslationKeys.username_length),
      ...validationOptions,
    }),
    IsString({
      message: i18nValidationMessage(TranslationKeys.username_not_string),
      ...validationOptions,
    }),
    IsNotEmpty({
      message: i18nValidationMessage(TranslationKeys.username_required),
      ...validationOptions,
    }),
  );
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message: i18nValidationMessage(TranslationKeys.password_weak),
        ...validationOptions,
      },
    ),
    IsNotEmpty({
      message: i18nValidationMessage(TranslationKeys.password_required),
      ...validationOptions,
    }),
    IsString({
      message: i18nValidationMessage(TranslationKeys.password_not_string),
      ...validationOptions,
    }),
  );
}

export function IsValidFullName(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Length(1, 255, {
      message: i18nValidationMessage(TranslationKeys.fullname_length),
      ...validationOptions,
    }),
    IsString({
      message: i18nValidationMessage(TranslationKeys.fullname_not_string),
      ...validationOptions,
    }),
  );
}

export function IsValidCode6(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsString(),
    Length(6, 6, {
      message: i18nValidationMessage(TranslationKeys.code6_length),
      ...validationOptions,
    }),
    Matches(/^\d{6}$/, {
      message: i18nValidationMessage(TranslationKeys.code6_not_numeric),
      ...validationOptions,
    }),
  );
}

export function IsValidRoles({
  enumType = Roles, // Default to Roles, but can be passed dynamically
  excludedRoles = [], // Exclusion array can be passed
}: {
  enumType: any;
  excludedRoles?: any[];
}) {
  // Merge the default exclusions with any custom exclusions
  const exclusions = [...excludedRoles];

  // Get the remaining allowed roles by filtering out the excluded roles from the enum
  const allowedRoles = Object.values(enumType).filter(
    (role) => !exclusions.includes(role),
  );

  // Construct the dynamic exclusion message
  const exclusionMessage = exclusions.length
    ? i18nValidationMessage(TranslationKeys.roles_exclusion_message, {
        roles: exclusions.join(', '),
      })
    : i18nValidationMessage(TranslationKeys.roles_no_exclusion_allowed);

  return applyDecorators(
    IsEnum(enumType, {
      each: true,
      message: i18nValidationMessage(TranslationKeys.roles_invalid_values, {
        allowedRoles: allowedRoles.join(', '),
      }),
    }),
    ArrayNotContains(exclusions, {
      message: exclusionMessage,
    }),
    ArrayMinSize(1, {
      message: i18nValidationMessage(TranslationKeys.roles_min_size),
    }),
    IsArray({
      message: i18nValidationMessage(TranslationKeys.roles_not_array),
    }),
  );
}
