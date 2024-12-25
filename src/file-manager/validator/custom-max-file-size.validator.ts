import { BadRequestException, FileValidator } from '@nestjs/common';
import * as bytes from 'bytes';
import {
  FileSizeUnit,
  NonEmptyArray,
  SupportedFileType,
} from '../types/file.types';
import { iterateAllFiles } from '../utils/filter-type-file.utils';
import { getExtensionByMimetype } from '../utils/get-extension-by-mimetype.util';
import { DefaultSizeLimits } from '../constants/file.constants';

export interface CustomMaxFileSizeValidatorOptions {
  sizeLimitsByType: Partial<Record<SupportedFileType, FileSizeUnit>>; // Allow one or more file types
  allowedTypes: NonEmptyArray<SupportedFileType>; // Allow one or more file types
  message?: (fileType: SupportedFileType, maxSize: FileSizeUnit) => string; // Custom error message
}

export class CustomMaxFileSizeValidator extends FileValidator<CustomMaxFileSizeValidatorOptions> {
  constructor(private readonly options: CustomMaxFileSizeValidatorOptions) {
    super(options);
    // Bind the checkSize method to preserve the context of "this"
    this.checkSize = this.checkSize.bind(this);
  }

  buildErrorMessage(file?: Express.Multer.File): string {
    const message = Object.entries(this.options.allowedTypes)
      .map(([index, fileType]) => `${fileType}: ${this.getMaxSize(fileType)}`)
      .join(', ');

    return `Some files exceed the maximum allowed size. Allowed limits are: ${message}.`;
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;

    return iterateAllFiles(file, this.checkSize);
  }

  private checkSize(file?: Express.Multer.File): boolean {
    const extension = getExtensionByMimetype(file);

    const maxSizeInBytes = bytes(this.getMaxSize(extension));
    // console.log(`file.originalname ${file.originalname}`);
    // console.log(`maxSizeInBytes ${maxSizeInBytes}`);
    // console.log(`file.size ${file.size}`);
    // console.log(`file.bytes ${bytes(file.size)}`);
    return file.size <= maxSizeInBytes;
  }

  private getMaxSize(type: SupportedFileType): string {
    if (type in this.options.sizeLimitsByType) {
      return this.options.sizeLimitsByType[type];
      // throw new BadRequestException(`Unsupported file type: ${extension}`);
    } else {
      return DefaultSizeLimits[type];
    }
  }
}
