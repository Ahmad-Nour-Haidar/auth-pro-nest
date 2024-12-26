import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CreateMethod } from '../enums/create-method.enum';
import { Roles } from '../../admins/enums/roles.enum';
import { FileMetadata } from '../../file-manager/classes/file-metadata';
import { generateFileUrl } from '../../file-manager/services/file-url.service';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  username: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  full_name?: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_logout_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at?: Date;

  @Column({ type: 'varchar', length: 6, nullable: true })
  verify_code: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @Column({ type: 'jsonb', nullable: true })
  profile_image?: FileMetadata;

  @Column({ type: 'jsonb', nullable: true })
  cover_image?: FileMetadata;

  @Column({
    type: 'enum',
    enum: CreateMethod,
    default: CreateMethod.localEmail,
  })
  create_method: CreateMethod;

  @Column({ type: 'timestamp', nullable: true })
  two_factor_enabled_at: Date;

  @Column({ type: 'varchar', nullable: true })
  two_factor_secret?: string;

  @Column({ type: 'timestamp', nullable: true })
  two_factor_verified_at?: Date;

  @Column({ type: 'varchar', nullable: true })
  two_factor_qr_code?: string;

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.user] })
  roles: Roles[];

  @AfterLoad()
  addFileUrls() {
    if (this.profile_image) {
      this.profile_image.url = generateFileUrl(this.profile_image);
    }
    if (this.cover_image) {
      this.cover_image.url = generateFileUrl(this.cover_image);
    }
  }
}
