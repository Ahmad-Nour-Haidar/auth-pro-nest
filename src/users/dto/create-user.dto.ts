import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Roles } from '../../auth/enums/roles.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' }) // todo check if required this.
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  readonly email: string;

  @IsNotEmpty({ message: 'Username is required' }) // todo check if required this.
  @IsString({ message: 'Username must be a string' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username can only contain letters and numbers',
  })
  @MaxLength(255, { message: 'Username must not exceed 255 characters' })
  readonly username: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  readonly full_name?: string;

  @IsNotEmpty({ message: 'Password is required' }) // todo check if required this.
  @IsString({ message: 'Password must be a string' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'Roles are required' }) // todo check if required this.
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Roles, { each: true, message: 'Invalid role value' })
  readonly roles: Roles[];
}
