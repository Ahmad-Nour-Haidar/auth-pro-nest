import { FileValidator, BadRequestException } from '@nestjs/common';
import { iterateAllFiles } from '../utils/filter-type-file.utils';
import { MulterFile, SupportedFileType } from '../types/file.types';
import { extension } from 'mime-types';

export interface CheckIsFileTypeAllowedForFieldValidatorOptions {
  message?: string; // Custom error message
  fields: Record<string, SupportedFileType[]>;
}

export class CheckIsFileTypeAllowedForFieldValidator extends FileValidator<CheckIsFileTypeAllowedForFieldValidatorOptions> {
  private allowedTypes: SupportedFileType[];

  constructor(
    private readonly options: CheckIsFileTypeAllowedForFieldValidatorOptions,
  ) {
    super(options);
    this.allowedTypes = Object.values(options.fields).flat();
    this.checkSingleFile = this.checkSingleFile.bind(this);
  }

  buildErrorMessage(fieldname?: string, fileType?: string): string {
    const customMessage = this.validationOptions.message;
    if (fieldname && fileType) {
      return (
        customMessage ||
        `The file type "${fileType}" is not allowed for the field "${fieldname}".`
      );
    }
    return (
      customMessage ||
      'Some of the file types do not match the allowed types for their respective fields.'
    );
  }

  isValid(files: Record<string, MulterFile[]>): boolean {
    if (!files) {
      throw new BadRequestException(
        this.buildErrorMessage(undefined, undefined),
      );
    }

    return iterateAllFiles(files, this.checkSingleFile);
  }

  private checkSingleFile(file: MulterFile): boolean {
    const fieldname = file.fieldname;
    const fileType = extension(file.mimetype);

    if (!fieldname) {
      throw new BadRequestException(
        `The field name for the file "${file.originalname}" is missing.`,
      );
    }

    if (!fileType || typeof fileType !== 'string') {
      throw new BadRequestException(
        `Unable to determine the file type for the file "${file.originalname}" in the field "${fieldname}". Please ensure the file has a valid type.`,
      );
    }

    if (!this.allowedTypes.includes(fileType as SupportedFileType)) {
      throw new BadRequestException(`${fileType} Not Allowed`);
    }

    const allowedTypes = this.options.fields[fieldname];
    if (!allowedTypes) {
      throw new BadRequestException(
        `No allowed file types are defined for the field "${fieldname}".`,
      );
    }

    if (!allowedTypes.includes(fileType as SupportedFileType)) {
      throw new BadRequestException(
        this.buildErrorMessage(fieldname, fileType),
      );
    }

    return true;
  }
}
