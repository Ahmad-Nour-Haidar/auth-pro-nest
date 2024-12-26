import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { MulterFile } from './types/file.types';
import { AllowedTypes } from './constants/file.constants';
import { createParseFilePipe } from './validator/files-validation-factory';
import { FileManagerService } from './file-manager.service';
import { FileStorageService } from './enums/file-storage-service.enum';

@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('image'))
  async single(
    @UploadedFile(
      createParseFilePipe({
        fields: { image: { allowedTypes: AllowedTypes.images } },
        sizeLimitsByType: {
          png: '30000KB',
          // jpg: '300KB',
          // jpeg: '300KB',
        },
      }),
    )
    file: MulterFile,
  ) {
    if (file) {
      return await this.fileManagerService.save({
        files: file,
        service: FileStorageService.LOCAL,
      });
    } else {
      return { msg: 'no file uploaded' };
    }
  }

  @Post('multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 12 },
      { name: 'avatar', maxCount: 1 },
      { name: 'document', maxCount: 1 },
      { name: 'videos', maxCount: 5 },
      { name: 'audio', maxCount: 3 },
    ]),
  )
  async multiple(
    @UploadedFiles(
      createParseFilePipe({
        fields: {
          images: { allowedTypes: AllowedTypes.images },
          document: { allowedTypes: AllowedTypes.documents },
        },
        sizeLimitsByType: {
          png: '30000KB',
          // pdf: '300KB',
          // jpg: '300KB',
          // jpeg: '300KB',
        },
      }),
    )
    files: {
      images: MulterFile[];
      document: MulterFile[];
    },
  ) {
    files.images.map((file) => {
      console.log(file.originalname, ' = ', file.fieldname);
    });
    files.document.map((file) => {
      console.log(file.originalname, ' = ', file.fieldname);
    });
  }
}
