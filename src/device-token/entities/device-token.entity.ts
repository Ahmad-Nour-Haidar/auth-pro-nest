import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { EntityTypeEnum } from '../enums/entity-type.enum';
import { Languages } from '../enums/languages.enum';

@Entity('device_tokens')
@Index('idx_entity_id', ['entity_id']) // Optimized for entity_id lookups
@Index('idx_firebase_device_token', ['firebase_device_token'], { unique: true }) // Unique constraint
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn({ type: 'uuid' })
  entity_id: string;

  @Column({ type: 'enum', enum: EntityTypeEnum })
  entity_type: EntityTypeEnum;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  firebase_device_token?: string;

  @Column({ type: 'enum', enum: Languages, default: Languages.en })
  lang: Languages;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
