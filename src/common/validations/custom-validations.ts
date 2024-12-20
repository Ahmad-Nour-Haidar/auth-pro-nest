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
} from 'class-validator';
import { Roles } from '../../admins/enums/roles.enum';

export function IsValidEmail() {
  return [
    IsEmail({}, { message: 'Email must be a valid email address' }),
    MaxLength(255, { message: 'Email must not exceed 255 characters' }),
    IsString({ message: 'Email must be a string' }),
    IsNotEmpty({ message: 'Email is required' }),
  ];
}

export function IsValidUsername() {
  return [
    Matches(/^[a-zA-Z0-9]+$/, {
      message: 'Username can only contain letters and numbers',
    }),
    MaxLength(255, { message: 'Username must not exceed 255 characters' }),
    IsString({ message: 'Username must be a string' }),
    IsNotEmpty({ message: 'Username is required' }),
  ];
}

export function IsValidPassword() {
  return [
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      },
    ),
    IsNotEmpty({ message: 'Password is required' }),
    IsString({ message: 'Password must be a string' }),
  ];
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
