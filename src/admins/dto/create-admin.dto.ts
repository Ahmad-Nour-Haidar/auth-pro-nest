import { IsOptional } from 'class-validator';
import { Roles } from '../enums/roles.enum';
import {
  IsValidConfirmPassword,
  IsValidEmail,
  IsValidFullName,
  IsValidPassword,
  IsValidRoles,
  IsValidUsername,
} from '../../common/validations/custom-validations';

export class CreateAdminDto {
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

  @IsValidRoles({
    enumType: Roles,
    excludedRoles: [Roles.superAdmin, Roles.user],
  })
  roles: Roles[];
}
