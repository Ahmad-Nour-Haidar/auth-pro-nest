import { IsOptional } from 'class-validator';
import {
  IsValidConfirmPassword,
  IsValidEmail,
  IsValidFullName,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';

export class CreateUserDto {
  @IsValidEmail()
  readonly email: string;

  @IsValidUsername()
  readonly username: string;

  @IsOptional()
  @IsValidFullName()
  readonly full_name?: string;

  @IsValidPassword()
  password: string;

  @IsValidConfirmPassword()
  readonly confirm_password: string;
}
