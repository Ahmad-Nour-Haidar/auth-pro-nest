import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import magicBytes from 'magic-bytes.js';
import { MulterFile } from '../types/file.types';
import { iterateAllFiles } from '../utils/filter-type-file.utils';

export class FileSignatureValidator extends FileValidator {
  constructor() {
    super({});
  }

  buildErrorMessage(): string {
    return 'validation failed (file type does not match file signature)';
  }

  isValid(files: any): boolean {
    return iterateAllFiles(files, this.checkSingleFile);
  }

  private checkSingleFile(file: MulterFile): boolean {
    // validate file signature
    // console.log(file.buffer); // 7364
    // console.log(file.buffer.toString('hex')); // 7364
    const filesSignatures = magicBytes(file.buffer).map((file) => file.mime);
    // console.log('filesSignatures', filesSignatures);
    // console.log('file.mimetype', file.mimetype);

    if (!filesSignatures.length) return false;

    return filesSignatures.includes(file.mimetype);
  }
}
