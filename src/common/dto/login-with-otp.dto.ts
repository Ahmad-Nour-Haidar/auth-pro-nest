import { IsOptional } from 'class-validator';
import {
  IsValidCode6,
  IsValidEmail,
  IsValidUsername,
} from '../validations/custom-validations';
import { AnyOf } from '../validations/any-of';

@AnyOf(['email', 'username'], {
  message: 'Either email or username must be provided.',
})
export class LoginWithOtpDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;

  @IsValidCode6()
  code: string;
}
