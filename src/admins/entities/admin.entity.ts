import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Roles } from '../enums/roles.enum';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'varchar', nullable: true, length: 500 })
  profile_image?: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  cover_image?: string;

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

  @Column({ type: 'timestamp', nullable: true })
  two_fa_enabled_at: Date;

  @Column({ type: 'varchar', nullable: true })
  two_factor_secret?: string;
}
