import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Roles } from '../../admins/enums/roles.enum';
import { Match } from '../../common/decorators/match.decorator';
import { CreateMethod } from '../enums/create-method.enum';

export class CreateUserDto {
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

  // @ValidateIf((_) => false) // Skipping validation if not provided by the user
  // @ArrayMinSize(1, { message: 'Roles must have at least one role' })
  // @ArrayMaxSize(1, { message: 'Roles must not exceed one role' })
  // @IsArray({ message: 'Roles must be an array' })
  // @IsEnum(Roles, { each: true, message: 'Invalid role value' })
  // readonly roles?: Roles[] = [Roles.user]; // Default value
  //
  // @ValidateIf((_) => false) // Skipping validation if not provided by the user
  // @IsEnum(CreateMethod, { message: 'Invalid method' })
  // readonly create_method: CreateMethod = CreateMethod.localEmail;
}
