import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';
import { NodeEnv } from '../../config/env.validation';
import { FileMetadata } from '../classes/file-metadata';
import { FileStorageService } from '../enums/file-storage-service.enum';

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

export function generateFileUrl(fileMetadata: FileMetadata): string {
  let baseUrl: string;
  if (fileMetadata.fileStorageService == FileStorageService.Cloudinary) {
    return fileMetadata.url;
  }
  const appHost = process.env.APP_HOST;
  const appPort = process.env.PORT;
  if (process.env.NODE_ENV == NodeEnv.development) {
    baseUrl = `${appHost}:${appPort}`;
  } else {
    baseUrl = appHost;
  }
  const relativePath = fileMetadata.path.replace(/\\/g, '/'); // Normalize path for URLs

  return `${baseUrl}/${relativePath}`;
}
