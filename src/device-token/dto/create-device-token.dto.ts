import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Languages } from '../enums/languages.enum';
import { EntityTypeEnum } from '../enums/entity-type.enum';

export class CreateDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @IsOptional()
  readonly firebase_device_token?: string;

  @IsEnum(Languages)
  @IsNotEmpty()
  @IsOptional()
  readonly lang?: Languages;

  @IsEnum(EntityTypeEnum)
  @IsNotEmpty()
  readonly entity_type: EntityTypeEnum;

  @IsUUID('4')
  @IsNotEmpty()
  readonly entity_id: string;
}
