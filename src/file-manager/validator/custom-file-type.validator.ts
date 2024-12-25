import { BadRequestException, FileValidator } from '@nestjs/common';
import { MulterFile, SupportedFileType } from '../types/file.types';
import { iterateAllFiles } from '../utils/filter-type-file.utils';
import { lookup, extension } from 'mime-types';

export interface CustomFileTypeValidatorOptions {
  allowedTypes: SupportedFileType[]; // List of allowed file extensions
}

export class CustomFileTypeValidator extends FileValidator<CustomFileTypeValidatorOptions> {
  private fileTypeRegex: RegExp;

  constructor(private readonly options: CustomFileTypeValidatorOptions) {
    super(options);
    this.fileTypeRegex = this.createFileTypeRegex(this.options.allowedTypes);
    this.checkSingleFile = this.checkSingleFile.bind(this);
  }

  isValid(files: any): boolean {
    if (!files) {
      throw new BadRequestException(`No file was uploaded.`);
    }

    return iterateAllFiles(files, this.checkSingleFile);
  }

  buildErrorMessage(): string {
    return `Allowed file types are: ${this.options.allowedTypes.join(', ')}`;
  }

  private checkSingleFile(file: MulterFile): boolean {
    const isValid = this.fileTypeRegex.test(file.mimetype);
    if (!isValid) {
      throw new BadRequestException(
        `File type '${extension(file.mimetype)}' is not allowed. Allowed types are: ${this.options.allowedTypes.join(', ')}`,
      );
    }
    return isValid;
  }

  private createFileTypeRegex = (fileTypes: SupportedFileType[]): RegExp => {
    const mediaTypes = fileTypes
      .map((type) => lookup(type))
      .filter((type) => type !== false);

    return new RegExp(mediaTypes.join('|'));
  };
}
