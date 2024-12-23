import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EntityTypeEnum } from '../../device-token/enums/entity-type.enum';

export class CreateNotificationDto {
  @IsUUID('4')
  @IsNotEmpty()
  entity_id: string;

  @IsEnum(EntityTypeEnum)
  @IsNotEmpty()
  entity_type: EntityTypeEnum;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsOptional()
  data?: Record<string, any>;
}
