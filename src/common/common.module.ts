import { Global, Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { BcryptService } from './services/bcrypt.service';
import { LodashService } from './services/lodash.service';
import { ResponseService } from './services/response.service';
import { MailService } from './services/mail.service';
import { TwoFactorAuthService } from './services/two-factor-auth.service';
import { JwtValidationService } from './services/jwt-validation.service';
import { RandomService } from './services/random.service';

@Global()
@Module({
  imports: [],
  controllers: [CommonController],
  providers: [
    BcryptService,
    LodashService,
    ResponseService,
    MailService,
    TwoFactorAuthService,
    JwtValidationService,
    RandomService,
  ],
  exports: [
    BcryptService,
    LodashService,
    ResponseService,
    MailService,
    TwoFactorAuthService,
    JwtValidationService,
    RandomService,
  ],
})
export class CommonModule {}
