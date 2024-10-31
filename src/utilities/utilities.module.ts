import { Global, Module } from '@nestjs/common';
import { BcryptService } from '../common/services/bcrypt.service';

@Global()
@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class UtilitiesModule {}
