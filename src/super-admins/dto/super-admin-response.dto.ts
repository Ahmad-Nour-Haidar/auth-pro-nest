import { Exclude, Expose } from 'class-transformer';
import { Roles } from 'src/admins/enums/roles.enum';

export class SuperAdminResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  full_name?: string;

  @Expose()
  blocked_at?: Date; // Expose the blocked_at timestamp field

  @Expose()
  deleted_at?: Date;

  @Expose()
  roles: Roles[];

  @Exclude()
  password?: string; // Ensure this is not included in the response

  @Exclude()
  confirm_password?: string;

  constructor(partial: Partial<SuperAdminResponseDto>) {
    Object.assign(this, partial);
  }
}
