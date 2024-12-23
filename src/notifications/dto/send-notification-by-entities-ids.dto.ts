import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendNotificationByEntitiesIdsDto {
  @IsArray({ message: 'entity_ids must be an array.' })
  @ArrayNotEmpty({ message: 'entity_ids array must not be empty.' })
  @IsUUID('4', {
    each: true,
    message: 'Each entity ID must be a valid UUID v4.',
  })
  readonly entity_ids: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly title: string;

  @IsString()
  readonly body?: string;

  @IsObject()
  @IsOptional()
  readonly data?: Record<string, any>;
}
