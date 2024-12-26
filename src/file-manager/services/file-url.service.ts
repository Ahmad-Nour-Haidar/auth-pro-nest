import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';
import { NodeEnv } from '../../config/env.validation';

@Injectable()
export class FileUrlService {
  constructor(private readonly configService: ConfigService) {}

  // generateFileUrl(filePath: string, useCloud: boolean = false): string {
  //   const cloudBaseUrl = this.configService.get<string>('CLOUD_BASE_URL');
  //   const appHost = this.configService.get<string>('APP_HOST');
  //   const appPort = this.configService.get<string>('PORT');
  //   let baseUrl: string;
  //   if (useCloud) {
  //     baseUrl = cloudBaseUrl;
  //   } else if (process.env.NODE_ENV == NodeEnv.development) {
  //     baseUrl = `${appHost}:${appPort}`;
  //   } else {
  //     baseUrl = appHost;
  //   }
  //   const relativePath = filePath.replace(/\\/g, '/'); // Normalize path for URLs
  //
  //   return `${baseUrl}/${relativePath}`;
  // }
}

export function generateFileUrl(
  filePath: string,
  useCloud: boolean = false,
): string {
  const cloudBaseUrl = process.env.CLOUD_BASE_URL;
  const appHost = process.env.APP_HOST;
  const appPort = process.env.PORT;
  let baseUrl: string;
  if (useCloud) {
    baseUrl = cloudBaseUrl;
  } else if (process.env.NODE_ENV == NodeEnv.development) {
    baseUrl = `${appHost}:${appPort}`;
  } else {
    baseUrl = appHost;
  }
  const relativePath = filePath.replace(/\\/g, '/'); // Normalize path for URLs

  return `${baseUrl}/${relativePath}`;
}
