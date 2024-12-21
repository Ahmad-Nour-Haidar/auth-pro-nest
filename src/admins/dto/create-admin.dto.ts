import {
  ArrayMinSize,
  ArrayNotContains,
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Roles } from '../enums/roles.enum';
import { Match } from '../../common/decorators/match.decorator';
import {
  IsValidEmail,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';

export class CreateAdminDto {
  @IsValidEmail()
  email: string;

  @IsValidUsername()
  username: string;

  @IsOptional()
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  @IsString({ message: 'Full name must be a string' })
  readonly full_name?: string;

  @IsValidPassword()
  password: string;

  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @IsEnum(Roles, {
    each: true,
    message: ({ value }) =>
      `Invalid role value "${value}". Valid roles are: ${Object.values(Roles).join(', ')}`,
  })
  @ArrayNotContains([Roles.superAdmin, Roles.user], {
    message: 'SuperAdmin role is not allowed',
  })
  @ArrayMinSize(1, { message: 'Roles must have at least one role' })
  @IsArray({ message: 'Roles must be an array' })
  readonly roles: Roles[];
}
