import { IsOptional } from 'class-validator';
import { AnyOf } from '../../common/validations/any-of';
import {
  IsValidCode6,
  IsValidEmail,
  IsValidUsername,
} from '../../common/validations/custom-validations';

@AnyOf(['email', 'username'], {
  message: 'Either email or username must be provided.',
})
export class VerifyCodeDto {
  @IsValidEmail()
  @IsOptional()
  email?: string;

  @IsValidUsername()
  @IsOptional()
  username?: string;

  @IsValidCode6()
  readonly code: string;
}
