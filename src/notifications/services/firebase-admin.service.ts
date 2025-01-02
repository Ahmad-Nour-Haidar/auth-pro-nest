import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor(configService: ConfigService) {
    const firebaseConfig = JSON.parse(
      configService.get<string>('FIREBASE_SERVICE_ACCOUNT'),
    );
    this.app = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
  }

  getMessaging(): admin.messaging.Messaging {
    return this.app.messaging();
  }

  // getAuth(): admin.auth.Auth {
  //   return this.app.auth();
  // }
}
