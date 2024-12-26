import { CreateUserDto } from './create-user.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { MulterFile } from '../../file-manager/types/file.types';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'confirm_password'] as const),
) {
  cover_image?: MulterFile;
  profile_image?: MulterFile;
}
