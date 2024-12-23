import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(
        // path in root
        'auth-pro-445313-firebase-adminsdk-c70k7-0f2a6740e7.json',
      ),
    });
  }

  getMessaging(): admin.messaging.Messaging {
    return this.app.messaging();
  }
}
