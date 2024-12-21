import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';
import { IsValidPassword } from '../../common/validations/custom-validations';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Old Password is required' })
  @IsString({ message: 'Old Password must be a string' })
  old_password: string;

  @IsValidPassword()
  password: string;

  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;
}
