import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
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

    try {
      // Check if a record with the given entity_id exists
      const existingToken = await this.deviceTokenRepository.findOneBy({
        entity_id,
      });
      if (existingToken) {
        // Update the existing record
        existingToken.firebase_device_token = firebase_device_token;
        existingToken.user_type = user_type;
        existingToken.lang = lang;
        return await this.deviceTokenRepository.save(existingToken);
      } else {
        // Create a new record
        return await this.deviceTokenRepository.save(createDeviceTokenDto);
      }
    } catch (error) {
      if (error.code === '23505') {
        // Handle unique constraint violation for firebase_device_token
        throw new BadRequestException(
          'The firebase_device_token is already associated with another entity.',
        );
      }
      throw error; // Rethrow any other errors
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

  /**
   * Get a single Firebase device token for a specific entity ID.
   * Ensures the token is not null or empty.
   */
  async getFirebaseDeviceToken(entity_id: string): Promise<DeviceToken | null> {
    const result = await this.deviceTokenRepository.findOne({
      where: { entity_id, firebase_device_token: Not(IsNull()) },
    });

    return result ?? null;
  }

  /**
   * Get multiple Firebase device tokens for a list of entity IDs.
   * Ensures tokens are not null or empty.
   */
  async getFirebaseDeviceTokens(entity_ids: string[]): Promise<DeviceToken[]> {
    return await this.deviceTokenRepository.find({
      where: {
        entity_id: In(entity_ids),
        firebase_device_token: Not(IsNull()),
      },
    });
  }

  async deleteFirebaseDeviceTokens(tokens: string[]): Promise<void> {
    if (!tokens.length) {
      return;
    }
    await this.deviceTokenRepository.delete({
      firebase_device_token: In(tokens),
    });
  }
}
