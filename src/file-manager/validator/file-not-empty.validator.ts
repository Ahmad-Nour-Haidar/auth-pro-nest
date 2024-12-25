import { FileValidator } from '@nestjs/common';
import { iterateAllFiles } from '../utils/filter-type-file.utils';

export interface FileNotEmptyValidatorOptions {
  message?: string; // Custom error message
}

export class FileNotEmptyValidator extends FileValidator<FileNotEmptyValidatorOptions> {
  // Centralized default message
  static readonly DEFAULT_MESSAGE = 'File is empty or not provided';

  constructor(options: FileNotEmptyValidatorOptions = {}) {
    super({
      message: options.message || FileNotEmptyValidator.DEFAULT_MESSAGE,
    });
  }

  buildErrorMessage(): string {
    // Return the custom error message or default one
    return this.validationOptions.message!;
  }

  isValid(
    file?: Express.Multer.File | Record<string, Express.Multer.File[]>,
  ): boolean {
    if (!file) return false;

    return iterateAllFiles(file, this.isSingleNotEmptyFile);
  }

  private isSingleNotEmptyFile(file: Express.Multer.File): boolean {
    return !!file && file.size > 0;
  }
}
