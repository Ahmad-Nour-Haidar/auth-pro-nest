import { Expose } from 'class-transformer';
import { Roles } from 'src/admins/enums/roles.enum';
import { CreateMethod } from '../enums/create-method.enum';

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
  create_method: CreateMethod;

  @Expose()
  profile_image?: string;

  @Expose()
  cover_image?: string;

  @Expose()
  blocked_at?: Date;

  @Expose()
  deleted_at?: Date;

  @Expose()
  password_changed_at?: Date;

  @Expose()
  last_login_at?: Date;

  @Expose()
  last_logout_at?: Date;

  @Expose()
  verified_at?: Date;

  @Expose()
  two_fa_enabled_at?: Date;

  @Expose()
  two_factor_verified_at?: Date;

  @Expose() created_at: Date;

  @Expose() updated_at: Date;

  @Expose()
  roles: Roles[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
