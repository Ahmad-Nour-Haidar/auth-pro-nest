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

@Injectable()
export class NotificationsService {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  async sendNotificationByEntityId(
    sendNotificationByEntityIdDto: SendNotificationByEntityIdDto,
  ): Promise<void> {
    const deviceToken = await this.deviceTokenService.getFirebaseDeviceToken(
      sendNotificationByEntityIdDto.entity_id,
    );

    if (!deviceToken || !deviceToken.firebase_device_token.length) {
      return;
    }

    await this.sendToSingleDevice({
      ...sendNotificationByEntityIdDto,
      firebase_device_token: deviceToken.firebase_device_token,
    });
  }

  private async sendToSingleDevice(
    sendNotificationToSingleDeviceDto: SendNotificationToSingleDeviceDto,
  ): Promise<void> {
    const { firebase_device_token, title, data, body } =
      sendNotificationToSingleDeviceDto;

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
    sendNotificationByEntitiesIdsDto: SendNotificationByEntitiesIdsDto,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenService.getFirebaseDeviceTokens(
      sendNotificationByEntitiesIdsDto.entity_ids,
    );

    const validTokens = deviceTokens
      .map((e) => e.firebase_device_token)
      .filter((token) => token.length);

    if (!validTokens.length) {
      return;
    }

    await this.sendToMultipleDevices({
      ...sendNotificationByEntitiesIdsDto,
      firebase_device_tokens: validTokens,
    });
  }

  private async sendToMultipleDevices(
    sendNotificationToMultiDevicesDto: SendNotificationToMultiDevicesDto,
  ): Promise<void> {
    const { firebase_device_tokens, title, body, data } =
      sendNotificationToMultiDevicesDto;

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
