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

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.Admin] })
  roles: Roles[];

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'timestamp', nullable: true, select: false })
  password_changed_at?: Date;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  profile_image?: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  cover_image?: string;

  @Column({ type: 'timestamp', nullable: true, select: false })
  last_login_at?: Date;

  @Column({ type: 'timestamp', nullable: true, select: false })
  last_logout_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at?: Date;
}
