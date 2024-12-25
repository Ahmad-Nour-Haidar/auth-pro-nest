import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import magicBytes from 'magic-bytes.js';

export class FileSignatureValidator extends FileValidator {
  constructor() {
    super({});
  }

  buildErrorMessage(): string {
    return 'validation failed (file type does not match file signature)';
  }

  async isValid(file: any): Promise<boolean> {
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
