import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { validate } from './config/env.validation';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AdminsModule } from './admins/admins.module';
import { UtilitiesModule } from './utilities/utilities.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
      validate,
    }),

    // JWT Module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),

    // Database configuration using TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // Set false in production
      }),
    }),

    // Rate Limiting (optional but recommended)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60,000 milliseconds (or 1 minute)
        limit: 10, // maximum number of requests allowed within the specified TTL
      },
    ]),

    // Application modules
    UsersModule,
    AuthModule,
    AdminsModule,
    UtilitiesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply to all routes, adjust as needed
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
