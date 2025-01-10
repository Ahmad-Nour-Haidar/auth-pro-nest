import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NodeEnv } from '../config/env.validation';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction =
    configService.get<string>('NODE_ENV') === NodeEnv.production;

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // Set false in production
    ...(isProduction && {
      ssl: {
        rejectUnauthorized: false, // Necessary for Supabase
      },
    }),
  };
};
