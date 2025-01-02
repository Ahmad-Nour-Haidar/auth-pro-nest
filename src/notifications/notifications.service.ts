import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from './services/firebase-admin.service';
import { SendNotificationByEntityIdDto } from './dto/send-notification-by-entity-id.dto';
import { DeviceTokenService } from '../device-token/device-token.service';
import { SendNotificationToSingleDeviceDto } from './dto/send-notification-to-single-device.dto';
import { SendNotificationByEntitiesIdsDto } from './dto/send-notification-by-entities-ids.dto';
import { SendNotificationToMultiDevicesDto } from './dto/send-notification-to-multi-devices.dto';
import {
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GenericRepository } from '../common/abstractions/generic-repository.repository';

@Injectable()
export class NotificationsService extends GenericRepository<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    // private readonly i18n: CustomI18nService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {
    super(notificationsRepository);
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsRepository.save(dto);
  }

  async findAll(entity_id: string, query?: Record<string, any>) {
    const { data, pagination } = await super.paginate({
      query,
      allowedFields: {
        title: 'string',
        body: 'string',
      },
      filterDeveloper: {
        entity_id,
      },
    });

    return {
      notifications: data,
      pagination,
    };
  }

  async findOne(id: string): Promise<Notification> {
    return super.get_one({ id });
  }

  async findOneByEntityId(entity_id: string): Promise<Notification> {
    return this.notificationsRepository.findOneBy({ entity_id });
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationsRepository.update({ id }, { read_at: new Date() });
    return super.get_one({ id });
  }

  async markAllAsRead(entity_id: string): Promise<void> {
    await this.notificationsRepository.update(
      { entity_id },
      { read_at: new Date() },
    );
  }

  // private async getNotificationById(id: string): Promise<Notification> {
  //   const notification = await this.notificationsRepository.findOneBy({ id });
  //   if (!notification) {
  //     throw new NotFoundException(
  //       this.i18n.tr(TranslationKeys.entity_not_found, {
  //         args: { id, name: this.notificationsRepository.metadata.name },
  //       }),
  //     );
  //   }
  //   return notification;
  // }

  async sendNotificationByEntityId(
    dto: SendNotificationByEntityIdDto,
  ): Promise<void> {
    const deviceToken = await this.deviceTokenService.getFirebaseDeviceToken(
      dto.entity_id,
    );

    if (!deviceToken || !deviceToken.firebase_device_token.length) {
      return;
    }

    await this.sendToSingleDevice({
      ...dto,
      firebase_device_token: deviceToken.firebase_device_token,
    });
  }

  private async sendToSingleDevice(
    dto: SendNotificationToSingleDeviceDto,
  ): Promise<void> {
    const { firebase_device_token, title, data, body } = dto;

    try {
      const messaging = this.firebaseAdminService.getMessaging();
      const message: Message = {
        notification: { title, body },
        token: firebase_device_token,
        data: data || undefined,
      };

      await messaging.send(message);
    } catch (error) {
      await this.removeFailedTokens([firebase_device_token]);
    }
  }

  async sendNotificationByEntitiesIds(
    dto: SendNotificationByEntitiesIdsDto,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenService.getFirebaseDeviceTokens(
      dto.entity_ids,
    );

    const validTokens = deviceTokens
      .map((e) => e.firebase_device_token)
      .filter((token) => token.length);

    if (!validTokens.length) {
      return;
    }

    await this.sendToMultipleDevices({
      ...dto,
      firebase_device_tokens: validTokens,
    });
  }

  private async sendToMultipleDevices(
    dto: SendNotificationToMultiDevicesDto,
  ): Promise<void> {
    const { firebase_device_tokens, title, body, data } = dto;

    const CHUNK_SIZE = 500;
    const messages: MulticastMessage[] = [];

    for (let i = 0; i < firebase_device_tokens.length; i += CHUNK_SIZE) {
      messages.push({
        notification: { title, body },
        tokens: firebase_device_tokens.slice(i, i + CHUNK_SIZE),
        data: data || undefined,
      });
    }

    const invalidTokens: string[] = [];

    try {
      const messaging = this.firebaseAdminService.getMessaging();

      const responses = await Promise.all(
        messages.map((msg) => messaging.sendEachForMulticast(msg)),
      );

      responses.forEach((response, index) => {
        response.responses.forEach((res, idx) => {
          if (!res.success) {
            invalidTokens.push(messages[index].tokens[idx]);
          }
        });
      });
    } catch (error) {
    } finally {
      if (invalidTokens.length) {
        await this.removeFailedTokens(invalidTokens);
      }
    }
  }

  private async removeFailedTokens(failedTokens: string[]): Promise<void> {
    if (failedTokens.length) {
      await this.deviceTokenService.deleteFirebaseDeviceTokens(failedTokens);
    }
  }
}
