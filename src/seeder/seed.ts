import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { UserFactory } from './user.factory';
import { MainSeeder } from './main.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeEnv } from '../config/env.validation';
import { getDatabaseConfig } from '../db/database.config';
import { User } from '../users/entities/user.entity';

async function getConfigService(): Promise<ConfigService> {
  // Initialize the ConfigModule to use environment variables
  await ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:
      process.env.NODE_ENV === NodeEnv.production ? '.env.prod' : '.env.dev',
  });

  return new ConfigService();

  // Create an instance of ConfigService
  // const configService = new ConfigService();
  // console.log(configService);
  // return configService;
}

async function start() {
  const configService = await getConfigService();

  // Get database configuration
  const dbConfig = getDatabaseConfig(configService) as DataSourceOptions;

  const options: DataSourceOptions & SeederOptions = {
    ...dbConfig,
    entities: [User],
    factories: [UserFactory],
    seeds: [MainSeeder],
  };

  const datasource = new DataSource(options);
  datasource.initialize().then(async () => {
    await datasource.synchronize(true);
    await runSeeders(datasource);
    process.exit();
  });
}

start().catch((_) => {});
