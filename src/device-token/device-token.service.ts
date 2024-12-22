import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';

@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  async set(createDeviceTokenDto: CreateDeviceTokenDto): Promise<DeviceToken> {
    const { entity_id, firebase_device_token, user_type, lang } =
      createDeviceTokenDto;

    // Check if a record with the given entity_id exists
    const existingToken = await this.deviceTokenRepository.findOneBy({
      entity_id,
    });

    if (existingToken) {
      // Update the existing record
      existingToken.firebase_device_token = firebase_device_token;
      existingToken.user_type = user_type;
      existingToken.lang = lang;
      return this.deviceTokenRepository.save(existingToken);
    } else {
      // Create a new record
      return this.deviceTokenRepository.save(createDeviceTokenDto);
    }
  }

  async deleteByEntityId(entity_id: string) {
    // Check if a record with the given entity_id exists
    const existingToken = await this.deviceTokenRepository.findOneBy({
      entity_id,
    });

    if (!existingToken) {
      throw new NotFoundException(
        `Device token with entity_id ${entity_id} not found`,
      );
    }

    // Delete the record
    await this.deviceTokenRepository.delete({ entity_id });

    return {
      message: `Device token with entity_id ${entity_id} deleted successfully`,
    };
  }
}
