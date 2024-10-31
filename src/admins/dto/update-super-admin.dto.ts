import { OmitType } from '@nestjs/mapped-types';
import { CreateSuperAdminDto } from './create-super-admin.dto';

export class UpdateSuperAdminDto extends OmitType(CreateSuperAdminDto, [
  'password',
  'confirm_password',
] as const) {}
