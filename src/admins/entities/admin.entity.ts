import { Column, Entity } from 'typeorm';
import { Roles } from '../enums/roles.enum';
import { FileMetadata } from '../../file-manager/classes/file-metadata';
import { BaseEntity } from '../../common/abstractions/base.entity';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  username: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  full_name?: string;

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.admin] })
  roles: Roles[];

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at?: Date;

  @Column({ type: 'jsonb', nullable: true })
  profile_image?: FileMetadata;

  @Column({ type: 'jsonb', nullable: true })
  cover_image?: FileMetadata;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_logout_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at?: Date;

  @Column({ type: 'varchar', length: 6, nullable: true })
  verify_code: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @Column({ type: 'varchar', nullable: true })
  two_factor_secret?: string;

  @Column({ type: 'varchar', nullable: true })
  two_factor_qr_code?: string;

  @Column({ type: 'timestamp', nullable: true })
  two_factor_enabled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  two_factor_verified_at?: Date;
}
