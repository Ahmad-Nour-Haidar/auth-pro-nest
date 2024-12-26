import { Expose, Transform } from 'class-transformer';
import { CreateMethod } from '../../users/enums/create-method.enum';
import { FileMetadata } from '../../file-manager/classes/file-metadata';
import { transformToDto } from '../../common/util/transform.util';

export class UserAuthResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  full_name?: string;

  @Expose()
  create_method: CreateMethod;

  @Expose()
  @Transform(({ value }) => {
    return transformToDto(FileMetadata, value);
  })
  profile_image?: FileMetadata;

  @Expose()
  @Transform(({ value }) => {
    return transformToDto(FileMetadata, value);
  })
  cover_image?: FileMetadata;

  @Expose() created_at: Date;

  @Expose() updated_at: Date;

  @Expose()
  verified_at?: Date;

  @Expose()
  two_factor_enabled_at?: Date;

  @Expose() two_factor_secret?: string;

  @Expose()
  two_factor_verified_at?: Date;

  @Expose() two_factor_qr_code?: string;

  // @Expose()
  // roles: Roles[];
  //
  // @Expose()
  // blocked_at?: Date;
  //
  // @Expose()
  // deleted_at?: Date;
  //
  // @Expose()
  // password_changed_at?: Date;
  // @Expose()
  // last_login_at?: Date;

  // @Expose()
  // last_logout_at?: Date;

  constructor(partial: Partial<UserAuthResponseDto>) {
    Object.assign(this, partial);
  }
}
