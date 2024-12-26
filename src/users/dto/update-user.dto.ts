import { CreateUserDto } from './create-user.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { MulterFile } from '../../file-manager/types/file.types';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'confirm_password'] as const),
) {
  cover_image?: MulterFile;
  profile_image?: MulterFile;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value.toString() === 'true')
  delete_cover_image?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value.toString() === 'true')
  delete_profile_image?: boolean;
}
