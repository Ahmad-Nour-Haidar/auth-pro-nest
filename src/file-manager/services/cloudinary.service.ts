import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { FileUrlService } from './file-url.service';

import { v2 as cloudinary } from 'cloudinary';
import { FolderStorage } from '../enums/folder-storage.enum';
import { FileMetadata } from '../classes/file-metadata';
import { FileStorageService } from '../enums/file-storage-service.enum';
import * as bytes from 'bytes';

@Injectable()
export class CloudinaryService {
  constructor(private readonly fileUrlService: FileUrlService) {
    cloudinary.config({
      cloud_name: 'dofzmmyai',
      api_key: '562669915113747',
      api_secret: 'eaW5sHNxNI_oM8c1dBkbr4cpwvU',
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

  /**
   * Generates a unique filename by appending a UUID to the original filename.
   *
   * @param originalName - The original filename
   * @returns A unique filename
   */
  private getUniqueFilename(originalName: string): string {
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const extension = originalName.split('.').pop() || 'file';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}-${uniqueSuffix}.${extension}`;
  }
}

/**
 * cloudinary result =  [
 *   {
 *     asset_id: '679fcce2e71d2d512ee07f3204a47951',
 *     public_id: 'user/zemw1peilavxaa7kpr6j',
 *     version: 1735228368,
 *     version_id: '704a20d2d4870cde2bc6f25435f327af',
 *     signature: '8ca828efd2a81605e23994fe39112ed5bb25e11f',
 *     width: 1920,
 *     height: 1080,
 *     format: 'png',
 *     resource_type: 'image',
 *     created_at: '2024-12-26T15:52:48Z',
 *     tags: [],
 *     bytes: 1307095,
 *     type: 'upload',
 *     etag: 'a61d93b0dad0ba2fb58b42f3220ba1ad',
 *     placeholder: false,
 *     url: 'http://res.cloudinary.com/dofzmmyai/image/upload/v1735228368/user/zemw1peilavxaa7kpr6j.png',
 *     secure_url: 'https://res.cloudinary.com/dofzmmyai/image/upload/v1735228368/user/zemw1peilavxaa7kpr6j.png',
 *     asset_folder: 'user',
 *     display_name: 'zemw1peilavxaa7kpr6j',
 *     original_filename: 'file',
 *     api_key: '562669915113747'
 *   }
 * ]*/
