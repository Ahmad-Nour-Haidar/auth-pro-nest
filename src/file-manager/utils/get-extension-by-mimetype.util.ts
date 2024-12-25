import { MulterFile, SupportedFileType } from '../types/file.types';
import { extension } from 'mime-types';

export function getExtensionByMimetype(file: MulterFile): SupportedFileType {
  return extension(file.mimetype) as SupportedFileType;
  // return file.mimetype.split('/')[1] as SupportedFileType;
}
