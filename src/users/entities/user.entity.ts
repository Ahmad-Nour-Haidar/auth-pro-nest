import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CreateMethod } from '../enums/create-method.enum';

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

  @Column({ type: 'varchar' })
  password: string;

  @Column({
    type: 'enum',
    enum: CreateMethod,
    default: CreateMethod.LocalEmail,
    select: false,
  })
  create_method: CreateMethod;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_logout_at?: Date;

  @Column({ type: 'varchar', length: 6, nullable: true })
  verify_code: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;
}
