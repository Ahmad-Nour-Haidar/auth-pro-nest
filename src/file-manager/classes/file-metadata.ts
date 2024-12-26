import { FileStorageService } from '../enums/file-storage-service.enum';
import { Exclude, Expose } from 'class-transformer';

export class FileMetadata {
  @Expose()
  size: string;

  @Expose()
  mimetype: string;

  @Expose()
  originalname: string;

  @Expose()
  uniqueName: string;

  @Expose()
  url?: string;

  @Exclude()
  fileStorageService: FileStorageService;

  @Exclude()
  path: string;

  // Cloudinary id
  @Exclude()
  public_id?: string;
}
