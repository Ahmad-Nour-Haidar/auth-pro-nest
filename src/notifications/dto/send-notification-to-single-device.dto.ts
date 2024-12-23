import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendNotificationToSingleDeviceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  firebase_device_token: string;
}
