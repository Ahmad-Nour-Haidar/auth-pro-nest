import { Injectable } from '@nestjs/common';
import { FileUrlService } from './file-url.service';

import { v2 as cloudinary } from 'cloudinary';
import { FolderStorage } from '../enums/folder-storage.enum';
import { FileMetadata } from '../classes/file-metadata';
import { FileStorageService } from '../enums/file-storage-service.enum';
import * as bytes from 'bytes';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Save one or more files to the specified directory.
   * If no directory is provided, saves to './uploads/defaults'.
   * Adds a unique identifier to filenames to avoid conflicts.
   *
   * @param files - One or more Express.Multer.File objects
   * @param folder
   * @returns A promise that resolves to an array of saved file paths
   */
  async uploadFiles(
    files: Express.Multer.File | Express.Multer.File[],
    folder: FolderStorage = FolderStorage.users,
  ): Promise<FileMetadata[]> {
    // Ensure files is an array
    files = Array.isArray(files) ? files : [files];

    return await Promise.all(
      files.map(async (file) => {
        // Handle Cloudinary upload
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder }, (error, result) => {
              if (error) return reject(error);
              resolve(result);
            })
            .end(file.buffer); // Upload file from memory buffer
        });

        // Return FileMetadata
        return {
          fileStorageService: FileStorageService.Cloudinary,
          size: bytes(file.size),
          mimetype: file.mimetype,
          originalname: file.originalname,
          path: folder,
          uniqueName: uploadResult.secure_url.toString().split('/').pop(),
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        } as FileMetadata;
      }),
    );
  }

  /**
   * Deletes a file from the filesystem.
   *
   * @param publicId
   */
  async deleteFile(publicId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result.result === 'ok'); // Check if the deletion was successful
      });
    });
  }
}
