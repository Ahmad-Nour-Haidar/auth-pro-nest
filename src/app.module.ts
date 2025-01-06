import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { NodeEnv, validate } from './config/env.validation';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AdminsModule } from './admins/admins.module';
import { SuperAdminsModule } from './super-admins/super-admins.module';
import { AdminsAuthModule } from './admins-auth/admins-auth.module';
import { CommonModule } from './common/common.module';
import { UsersAuthModule } from './users-auth/users-auth.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeviceTokenModule } from './device-token/device-token.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { FileManagerModule } from './file-manager/file-manager.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as process from 'node:process';
import { WithDeletedMiddleware } from './middleware/with-deleted.middleware';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerExceptionFilter } from './common/exceptions/throttler-exception/throttler-exception.filter';

@Global()
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === NodeEnv.production ? '.env.prod' : '.env.dev',
      validate,
    }),

    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
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
        ttl: minutes(1),
        limit: 3, // maximum number of requests allowed within the specified TTL
      },
    ]),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to your uploads folder
      serveRoot: '/uploads', // Publicly accessible URL prefix
    }),

    // Application modules
    AppModule,
    AdminsModule,
    SuperAdminsModule,
    AdminsAuthModule,
    UsersModule,
    UsersAuthModule,
    CommonModule,
    DeviceTokenModule,
    NotificationsModule,
    FileManagerModule,
  ],
  providers: [
    AppService,
    JwtStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
  controllers: [AppController],
  exports: [JwtModule, UsersAuthModule, AdminsAuthModule, FileManagerModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply to all routes, adjust as needed
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(WithDeletedMiddleware).forRoutes('*');
  }
}
