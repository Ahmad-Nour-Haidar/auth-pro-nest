import { Entity, Column, Index, PrimaryColumn } from 'typeorm';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { Languages } from '../enums/languages.enum';
import { BaseEntity } from '../../common/abstractions/base.entity';

@Entity('device_tokens')
@Index('idx_entity_id', ['entity_id'], { unique: true }) // Optimized for entity_id lookups
@Index('idx_firebase_device_token', ['firebase_device_token'], { unique: true }) // Unique constraint
export class DeviceToken extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  entity_id: string;

  @Column({ type: 'enum', enum: EntityTypeEnum })
  entity_type: EntityTypeEnum;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  firebase_device_token?: string;

  @Column({ type: 'enum', enum: Languages, default: Languages.en })
  lang: Languages;
}
