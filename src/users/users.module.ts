import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { BcryptService } from './services/bcrypt.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
  exports: [BcryptService],
})
export class UsersModule {}
