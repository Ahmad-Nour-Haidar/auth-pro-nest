import { Expose, Type } from 'class-transformer';
import { Roles } from 'src/admins/enums/roles.enum';
import { FileMetadata } from '../../file-manager/classes/file-metadata';

export class AdminResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  full_name?: string;

  @Expose()
  roles: Roles[];

  @Expose()
  password_changed_at?: Date;

  @Expose()
  @Type(() => FileMetadata)
  profile_image?: FileMetadata;

  @Expose()
  @Type(() => FileMetadata)
  cover_image?: FileMetadata;

  @Expose()
  last_login_at?: Date;

  @Expose()
  last_logout_at?: Date;

  @Expose() created_at: Date;

  @Expose() updated_at: Date;

  @Expose()
  blocked_at?: Date;

  @Expose()
  deleted_at?: Date;

  @Expose()
  verified_at?: Date;

  @Expose()
  two_factor_enabled_at?: Date;

  @Expose()
  two_factor_verified_at?: Date;

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}
