import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Roles } from '../../auth/enums/roles.enum';

import { LoginMethod } from '../../auth/enums/login-method.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'string', length: 255 })
  email: string;

  @Column({ unique: true, type: 'string', length: 255 })
  username: string;

  @Column({ nullable: true, type: 'string', length: 255 })
  full_name?: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.User] })
  roles: Roles[];

  @Column({ type: 'enum', enum: LoginMethod })
  login_method: LoginMethod;

  @Column({ nullable: true })
  verify_code?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @Column({ nullable: true })
  blocked_at?: Date;

  @Column({ nullable: true })
  password_changed_at?: Date;

  @Column({ nullable: true })
  approved_at?: Date;

  @Column({ nullable: true })
  last_login_at?: Date;

  @Column({ nullable: true })
  last_logout_at?: Date;
}
