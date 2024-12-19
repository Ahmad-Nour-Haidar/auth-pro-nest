import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateMeAdminDto extends PartialType(
  OmitType(CreateAdminDto, ['password', 'confirm_password', 'roles'] as const),
) {}
