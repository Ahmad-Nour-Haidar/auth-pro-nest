import { IsOptional } from 'class-validator';
import { AnyOf } from '../../common/validations/any-of';
import {
  IsValidEmail,
  IsValidPassword,
  IsValidUsername,
} from '../../common/validations/custom-validations';

@AnyOf(['email', 'username'], {
  message: 'Either email or username must be provided.',
})
export class LoginUserDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;

  @IsValidPassword()
  password: string;
}
