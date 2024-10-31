import { CreateAdminDto } from './create-admin.dto';
import { Roles } from '../enums/roles.enum';
import { IsArray, IsEnum } from 'class-validator';

export class CreateSuperAdminDto extends CreateAdminDto {
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Roles, { each: true, message: 'Invalid role value' })
  readonly roles: Roles[] = [Roles.SuperAdmin];
}

// export class CreateSuperAdminDto extends OmitType(CreateAdminDto, [
//   'password',
//   'confirm_password',
//   'roles',
// ] as const) {}
