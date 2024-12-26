import { Injectable } from '@nestjs/common';
import { LocalFileService } from './services/local-file.service';
import { MulterFile } from './types/file.types';
import { FileStorageService } from './enums/file-storage-service.enum';
import { FileMetadata } from './classes/file-metadata';

export interface SaveFileParams {
  files: MulterFile | MulterFile[]; // Accepts one or multiple MulterFile objects
  service?: FileStorageService; // Defaults to LOCAL if not provided
  path?: string; // Defaults to '/defaults' if not provided
}

@Injectable()
export class FileManagerService {
  constructor(private localFileService: LocalFileService) {}

  async save(params: SaveFileParams): Promise<FileMetadata[]> {
    const { files, service = FileStorageService.LOCAL, path } = params;

    if (service === FileStorageService.LOCAL) {
      return await this.localFileService.saveFiles(files, path);
    } else if (service === FileStorageService.AWS_S3) {
    } else if (service === FileStorageService.GOOGLE_CLOUD) {
    } else {
      throw new Error(`Unsupported service: ${service}`);
    }
  }
}

// for (const file of fileArray) {
//   //  else if (service === FileStorageService.AWS_S3) {
//   //   // const path = await this.cloudFileService.uploadToS3(
//   //   //   'my-bucket',
//   //   //   uniqueFilename,
//   //   //   data,
//   //   // );
//   //   // results.push(path);
//   // }
// }
