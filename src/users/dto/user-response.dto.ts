import { Exclude, Expose, Type } from 'class-transformer';
import { Roles } from 'src/admins/enums/roles.enum';
import { CreateMethod } from '../enums/create-method.enum';
import { FileMetadata } from '../../file-manager/classes/file-metadata';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  full_name?: string;

  @Expose()
  password_changed_at?: Date;

  @Expose()
  last_login_at?: Date;

  @Expose()
  last_logout_at?: Date;

  @Expose() created_at: Date;

  @Expose() updated_at: Date;

  @Expose()
  deleted_at?: Date;

  @Expose()
  blocked_at?: Date;

  @Expose()
  verified_at?: Date;

  @Expose()
  @Type(() => FileMetadata)
  profile_image?: FileMetadata;

  @Expose()
  @Type(() => FileMetadata)
  cover_image?: FileMetadata;

  @Expose()
  create_method: CreateMethod;

  @Expose()
  two_factor_enabled_at?: Date;

  @Expose()
  two_factor_verified_at?: Date;

  @Exclude()
  // two_factor_secret?: string;
  //
  // @Exclude()
  // two_factor_qr_code?: string;

  @Expose()
  roles: Roles[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
