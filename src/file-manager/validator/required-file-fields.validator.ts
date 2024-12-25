import { BadRequestException, FileValidator } from '@nestjs/common';
import { isSingleFile } from '../utils/filter-type-file.utils';

export interface RequiredFileFieldsValidatorOptions {
  requiredFields: string[]; // List of required field names
}

export class RequiredFileFieldsValidator extends FileValidator<RequiredFileFieldsValidatorOptions> {
  constructor(private readonly options: RequiredFileFieldsValidatorOptions) {
    super(options);
  }

  isValid(files: any): boolean {
    if (!files) {
      throw new BadRequestException(`No files were uploaded.`);
    }

    if (isSingleFile(files)) {
      const singleFile = files as Express.Multer.File;
      if (!this.options.requiredFields.includes(singleFile.fieldname)) {
        throw new BadRequestException(
          `Field '${singleFile.fieldname}' is not expected.`,
        );
      }
      return true;
    }

    // Check for missing required fields
    const missingFields = this.options.requiredFields.filter(
      (field) => !files[field] || files[field].length === 0,
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required files for the following fields: ${missingFields.join(', ')}`,
      );
    }

    return true; // All required fields are present
  }

  buildErrorMessage(): string {
    return `Missing required file fields: ${this.options.requiredFields.join(', ')}`;
  }
}
