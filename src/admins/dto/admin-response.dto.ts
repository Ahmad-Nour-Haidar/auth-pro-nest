import { Exclude, Expose } from 'class-transformer';
import { Roles } from '../enums/roles.enum';

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

  @Exclude()
  password?: string; // Ensure this is not included in the response

  @Exclude()
  confirm_password?: string; // Also exclude this field

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}
