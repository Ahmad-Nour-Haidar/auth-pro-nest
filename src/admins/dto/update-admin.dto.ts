import { OmitType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends OmitType(CreateAdminDto, [
  'password',
  'confirm_password',
] as const) {}
