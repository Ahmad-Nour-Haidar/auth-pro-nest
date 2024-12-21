import { IsOptional } from 'class-validator';
import {
  IsValidEmail,
  IsValidUsername,
} from '../../common/validations/custom-validations';
import { AnyOf } from '../../common/validations/any-of';

@AnyOf(['email', 'username'], {
  message: 'Either email or username must be provided.',
})
export class CheckEmailDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;
}
