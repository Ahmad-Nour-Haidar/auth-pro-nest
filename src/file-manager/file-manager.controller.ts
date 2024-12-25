import {
  Controller,
  ParseFilePipe,
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
import * as bytes from 'bytes';
import { iterateAllFiles } from './utils/filter-type-file.utils';
import { createParseFilePipe } from './validator/files-validation-factory';

@Controller('file-manager')
export class FileManagerController {
  @Post('single')
  @UseInterceptors(FileInterceptor('image'))
  async single(
    @UploadedFile(
      createParseFilePipe({
        requiredFields: ['image'],
        allowedTypes: AllowedTypes.images,
        sizeLimitsByType: {
          // png: '300KB',
          // jpg: '300KB',
          // jpeg: '300KB',
        },
      }),
    )
    file: MulterFile,
  ) {
    if (file) {
      return {
        filename: file.filename,
        originalname: file.originalname,
        size: bytes(file.size),
      };
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
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [],
      }),
    )
    files: MulterFile[],
  ) {
    console.log('-------- in controller -------------');
    console.log(typeof files);
    return iterateAllFiles(files, (file) => {
      console.log(file.originalname);
      return true;
    });
  }
}
