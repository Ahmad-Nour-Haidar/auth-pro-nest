import {
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
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @ArrayNotContains([Roles.SuperAdmin], {
    message: 'SuperAdmin role is not allowed',
  })
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Roles, { each: true, message: 'Invalid role value' })
  @IsNotEmpty() // { message: 'Roles is required' }
  readonly roles: Roles[];
}
