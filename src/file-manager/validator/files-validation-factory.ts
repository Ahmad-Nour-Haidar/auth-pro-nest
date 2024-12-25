import {
  FileSizeUnit,
  NonEmptyArray,
  SupportedFileType,
} from '../types/file.types';
import {
  HttpStatus,
  ParseFilePipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { FileNotEmptyValidator } from './file-not-empty.validator';
import { CustomMaxFileSizeValidator } from './custom-max-file-size.validator';
import { CustomFileTypeValidator } from './custom-file-type.validator';
import { FileSignatureValidator } from './file-signature.validator';
import { RequiredFileFieldsValidator } from './required-file-fields.validator';

export interface CreateParseFilePipeOptions<
  TAllowedTypes extends SupportedFileType = SupportedFileType,
> {
  allowedTypes: NonEmptyArray<TAllowedTypes>; // Required
  requiredFields?: string[]; // Optional
  sizeLimitsByType?: Partial<Record<TAllowedTypes, FileSizeUnit>>; // Automatically scoped to `allowedTypes`
}

export const createParseFilePipe = <
  TAllowedTypes extends SupportedFileType = SupportedFileType,
>({
  allowedTypes,
  requiredFields = [], // Default to empty array
  sizeLimitsByType = {}, // Default to empty object
}: CreateParseFilePipeOptions<TAllowedTypes>): ParseFilePipe => {
  let validators: FileValidator[] = [];

  // Add file validation logic
  if (requiredFields.length) {
    validators = [
      new RequiredFileFieldsValidator({
        requiredFields,
      }),

      new FileNotEmptyValidator(),

      new CustomMaxFileSizeValidator({
        sizeLimitsByType,
        allowedTypes,
      }),

      new CustomFileTypeValidator({
        allowedTypes,
      }),

      new FileSignatureValidator(),
    ];
  }

  return new ParseFilePipe({
    errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    exceptionFactory: (error: string) => {
      throw new UnprocessableEntityException(error);
    },
    validators: validators,
  });
};
