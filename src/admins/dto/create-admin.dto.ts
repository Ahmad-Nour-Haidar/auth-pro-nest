import {
  ArrayMinSize,
  ArrayNotContains,
  IsArray,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Roles } from '../enums/roles.enum';
import { Match } from '../../common/decorators/match.decorator';

export class CreateAdminDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username can only contain letters and numbers',
  })
  @MaxLength(255, { message: 'Username must not exceed 255 characters' })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsOptional()
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  @IsString({ message: 'Full name must be a string' })
  readonly full_name?: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
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
