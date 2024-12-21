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

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsEmail(
      {},
      { message: 'Email must be a valid email address', ...validationOptions },
    ),
    MaxLength(255, {
      message: 'Email must not exceed 255 characters',
      ...validationOptions,
    }),
    IsString({ message: 'Email must be a string', ...validationOptions }),
    IsNotEmpty({ message: 'Email is required', ...validationOptions }),
  );
}

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(/^[a-zA-Z0-9]+$/, {
      message: 'Username can only contain letters and numbers',
      ...validationOptions,
    }),
    MaxLength(255, {
      message: 'Username must not exceed 255 characters',
      ...validationOptions,
    }),
    IsString({ message: 'Username must be a string', ...validationOptions }),
    IsNotEmpty({ message: 'Username is required', ...validationOptions }),
  );
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ...validationOptions,
      },
    ),
    IsNotEmpty({ message: 'Password is required', ...validationOptions }),
    IsString({ message: 'Password must be a string', ...validationOptions }),
  );
}

export function IsValidCode6(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsString(),
    Length(6, 6, {
      message: 'Verification code must be 6 characters long',
      ...validationOptions,
    }),
    Matches(/^\d{6}$/, {
      message: 'Verification code must be a 6-digit number',
      ...validationOptions,
    }),
  );
}

export function IsValidRoles({
  notContains = [],
}: { notContains?: Roles[] } = {}) {
  // Default excluded roles
  const defaultExcludedRoles = [Roles.superAdmin, Roles.user];

  // Merge the default roles with any custom exclusions
  const exclusions = [...defaultExcludedRoles, ...notContains];

  return [
    IsEnum(Roles, {
      each: true,
      message: ({ value }) =>
        `Invalid role value "${value}". Valid roles are: ${Object.values(Roles).join(', ')}`,
    }),
    ArrayNotContains(exclusions, {
      message: `The following roles are not allowed: ${exclusions.join(', ')}`,
    }),
    ArrayMinSize(1, { message: 'Roles must have at least one role' }),
    IsArray({ message: 'Roles must be an array' }),
  ];
}
