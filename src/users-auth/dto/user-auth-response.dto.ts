import { Expose } from 'class-transformer';
import { CreateMethod } from '../../users/enums/create-method.enum';

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
  profile_image?: string;

  @Expose()
  cover_image?: string;

  @Expose() created_at: Date;

  @Expose() updated_at: Date;

  @Expose() two_factor_secret?: string;

  @Expose()
  two_fa_enabled_at?: Date;

  @Expose()
  two_factor_verified_at?: Date;

  @Expose() qr_code_image_url?: string;

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

  // @Expose()
  // verified_at?: Date;

  constructor(partial: Partial<UserAuthResponseDto>) {
    Object.assign(this, partial);
  }
}
