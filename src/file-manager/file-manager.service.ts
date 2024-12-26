import { Injectable } from '@nestjs/common';
import { LocalFileService } from './services/local-file.service';
import { MulterFile } from './types/file.types';
import { FileStorageService } from './enums/file-storage-service.enum';
import { FileMetadata } from './classes/file-metadata';
import { CloudinaryService } from './services/cloudinary.service';
import { FolderStorage } from './enums/folder-storage.enum';

export interface SaveFileParams {
  files: MulterFile | MulterFile[]; // Accepts one or multiple MulterFile objects
  service?: FileStorageService; // Defaults to LOCAL if not provided
  folder?: FolderStorage.users; // Defaults to '/users' if not provided
}

@Injectable()
export class FileManagerService {
  constructor(
    private readonly localFileService: LocalFileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async save(params: SaveFileParams): Promise<FileMetadata[]> {
    const {
      files,
      service = FileStorageService.LOCAL,
      folder = FolderStorage.users,
    } = params;

    if (service === FileStorageService.LOCAL) {
      return await this.localFileService.saveFiles(files, folder);
    } else if (service === FileStorageService.Cloudinary) {
      return await this.cloudinaryService.uploadFiles(
        files,
        FolderStorage.users,
      );
    } else {
      throw new Error(`Unsupported service: ${service}`);
    }
  }

  async delete(...params: FileMetadata[]) {
    await Promise.all(
      params.map(async (file) => {
        if (file.fileStorageService === FileStorageService.LOCAL) {
          await this.localFileService.deleteFile(file.path);
        } else if (file.fileStorageService === FileStorageService.Cloudinary) {
          await this.cloudinaryService.deleteFile(file.public_id);
        }
      }),
    );
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
