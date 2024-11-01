import { OmitType } from '@nestjs/mapped-types';
import { CreateAdminDto } from '../../admins/dto/create-admin.dto';

export class CreateSuperAdminDto extends OmitType(CreateAdminDto, [
  'roles',
] as const) {}
