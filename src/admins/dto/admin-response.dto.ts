import { Expose } from 'class-transformer';
import { Roles } from 'src/admins/enums/roles.enum';

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
  profile_image?: string;

  @Expose()
  cover_image?: string;

  @Expose()
  blocked_at?: Date; // Expose the blocked_at timestamp field

  @Expose()
  deleted_at?: Date;

  @Expose()
  roles: Roles[];

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}
