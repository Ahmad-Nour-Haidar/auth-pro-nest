import { FileSizeUnit, SupportedFileType } from '../types/file.types';
import {
  HttpStatus,
  ParseFilePipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { FileNotEmptyValidator } from './file-not-empty.validator';
import { CustomMaxFileSizeValidator } from './custom-max-file-size.validator';
import { FileSignatureValidator } from './file-signature.validator';
import { RequiredFileFieldsValidator } from './required-file-fields.validator';
import { CheckIsFileTypeAllowedForFieldValidator } from './check-is-file-type-allowed-for-field.validator';

export interface CreateParseFilePipeOptions<
  TAllowedTypes extends SupportedFileType = SupportedFileType,
> {
  // allowedTypes: NonEmptyArray<TAllowedTypes>; // Required
  fields: Record<string, TAllowedTypes[]>; // Optional
  sizeLimitsByType?: Partial<Record<TAllowedTypes, FileSizeUnit>>; // Automatically scoped to `allowedTypes`
}

export const createParseFilePipe = <
  TAllowedTypes extends SupportedFileType = SupportedFileType,
>({
  fields = {}, // Default to empty array
  sizeLimitsByType = {}, // Default to empty object
  // allowedTypes,
}: CreateParseFilePipeOptions<TAllowedTypes>): ParseFilePipe => {
  const requiredFields = Object.keys(fields);

  const allowedTypes = Array.from(new Set(Object.values(fields).flat()));

  // Add file validation logic
  let validators: FileValidator[] = [];

  if (Object.keys(fields).length) {
    validators = [
      new RequiredFileFieldsValidator({
        requiredFields,
      }),

      new FileNotEmptyValidator(),

      new CustomMaxFileSizeValidator({
        sizeLimitsByType,
        allowedTypes,
      }),

      new CheckIsFileTypeAllowedForFieldValidator({
        fields,
      }),

      new FileSignatureValidator(),
    ];
  }

  return new ParseFilePipe({
    fileIsRequired: false,
    validators: validators,
    errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    exceptionFactory: (error: string) => {
      throw new UnprocessableEntityException(error);
    },
  });
};
