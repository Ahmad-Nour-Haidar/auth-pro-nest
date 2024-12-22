import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';

@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    private readonly i18n: CustomI18nService,
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

  async deleteByEntityId({
    entity_id,
    throwIfNotFound = true,
  }: {
    entity_id: string;
    throwIfNotFound?: boolean;
  }): Promise<void> {
    if (throwIfNotFound) {
      // Check if a record with the given entity_id exists
      const existingToken = await this.deviceTokenRepository.findOneBy({
        entity_id,
      });

      if (!existingToken) {
        throw new NotFoundException(
          this.i18n.tr(TranslationKeys.device_token_not_found, {
            args: { entity_id },
          }),
        );
      }
    }

    // Delete the record
    await this.deviceTokenRepository.delete({ entity_id });
  }
}
