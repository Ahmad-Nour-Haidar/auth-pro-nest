import { IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';
import {
  IsValidEmail,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';

export class CreateUserDto {
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
}
