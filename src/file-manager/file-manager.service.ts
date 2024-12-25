import { Injectable } from '@nestjs/common';
import { LocalFileService } from './services/local-file.service';
import { MulterFile } from './types/file.types';
import { FileStorageService } from './enums/file-storage-service.enum';

export interface SaveFileParams {
  files: MulterFile | MulterFile[]; // Accepts one or multiple MulterFile objects
  service?: FileStorageService; // Defaults to LOCAL if not provided
}

@Injectable()
export class FileManagerService {
  constructor(private localFileService: LocalFileService) {}

  async save(params: SaveFileParams): Promise<string[]> {
    const { files, service = FileStorageService.LOCAL } = params;

    const fileArray = Array.isArray(files) ? files : [files];
    const results: string[] = [];

    for (const file of fileArray) {
      const uniqueFilename =
        file.originalname || `${Date.now()}-${file.originalname}`;
      const data = file.buffer;

      if (service === FileStorageService.LOCAL) {
        // const path = await this.localFileService.saveFile(uniqueFilename, data);
        // results.push(path);
      } else if (service === FileStorageService.AWS_S3) {
        // const path = await this.cloudFileService.uploadToS3(
        //   'my-bucket',
        //   uniqueFilename,
        //   data,
        // );
        // results.push(path);
      } else {
        throw new Error(`Unsupported service: ${service}`);
      }
    }

    return results;
  }
}
