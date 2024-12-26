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

export interface FieldValidationOptions<
  TAllowedTypes extends SupportedFileType = SupportedFileType,
> {
  required?: boolean; // Default: false
  allowedTypes: TAllowedTypes[];
}

export interface CreateParseFilePipeOptions<
  TAllowedTypes extends SupportedFileType = SupportedFileType,
> {
  fields: Record<string, FieldValidationOptions<TAllowedTypes>>; // Updated structure
  sizeLimitsByType?: Partial<Record<TAllowedTypes, FileSizeUnit>>; // Automatically scoped to `allowedTypes`
}

export const createParseFilePipe = <
  TAllowedTypes extends SupportedFileType = SupportedFileType,
>({
  fields = {}, // Default to empty object
  sizeLimitsByType = {}, // Default to empty object
}: CreateParseFilePipeOptions<TAllowedTypes>): ParseFilePipe => {
  // Extract required fields
  const requiredFields = Object.entries(fields)
    .filter(([, options]) => options.required)
    .map(([fieldName]) => fieldName);

  // Extract all allowed file types
  const allowedTypes = Array.from(
    new Set(Object.values(fields).flatMap((options) => options.allowedTypes)),
  );

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
        fields: Object.fromEntries(
          Object.entries(fields).map(([key, options]) => [
            key,
            options.allowedTypes,
          ]),
        ),
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
