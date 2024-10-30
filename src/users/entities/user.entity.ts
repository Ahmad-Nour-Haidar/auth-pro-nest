import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Roles } from '../../auth/enums/roles.enum';
import { CreateMethod } from '../../auth/enums/create-method.enum';

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

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.User] })
  roles: Roles[];

  @Column({
    type: 'enum',
    enum: CreateMethod,
    default: CreateMethod.LocalEmail,
    select: false,
  })
  create_method: CreateMethod;

  @Column({ nullable: true, type: 'varchar', length: 255, select: false })
  verify_code?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at?: Date;

  @Column({ type: 'timestamp', nullable: true, select: false })
  password_changed_at?: Date;

  @Column({ type: 'timestamp', nullable: true, select: false })
  approved_at?: Date;

  @Column({ type: 'timestamp', nullable: true, select: false })
  last_login_at?: Date;

  @Column({ type: 'timestamp', nullable: true, select: false })
  last_logout_at?: Date;
}
