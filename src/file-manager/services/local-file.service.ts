import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import * as bytes from 'bytes';
import { FileUrlService } from './file-url.service';
import { FileMetadata } from '../classes/file-metadata';
import { FileStorageService } from '../enums/file-storage-service.enum';

@Injectable()
export class LocalFileService {
  constructor(private readonly fileUrlService: FileUrlService) {}

  private readonly baseUploadPath = './uploads'; // Base upload directory
  private readonly defaultPath = 'defaults'; // Default subdirectory

  /**
   * Save one or more files to the specified directory.
   * If no directory is provided, saves to './uploads/defaults'.
   * Adds a unique identifier to filenames to avoid conflicts.
   *
   * @param files - One or more Express.Multer.File objects
   * @param path - Optional subdirectory under './uploads'
   * @returns A promise that resolves to an array of saved file paths
   */
  async saveFiles(
    files: Express.Multer.File | Express.Multer.File[],
    path?: string,
  ): Promise<FileMetadata[]> {
    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [files];

    // Determine the upload path
    const uploadDir = join(this.baseUploadPath, path || this.defaultPath);

    // Create the directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save each file and return their paths
    return await Promise.all(
      fileArray.map(async (file) => {
        const uniqueName = this.getUniqueFilename(file.originalname);
        const path = join(uploadDir, uniqueName);
        await writeFile(path, file.buffer);
        const s: FileMetadata = {
          fileStorageService: FileStorageService.LOCAL,
          size: bytes(file.size),
          mimetype: file.mimetype,
          originalname: file.originalname,
          uniqueName: uniqueName,
          path: path.replace(/\\/g, '/'),
        };
        return s;
      }),
    );
  }

  /**
   * Deletes a file from the filesystem.
   *
   * @param filepath - The full path of the file to delete
   */
  async deleteFile(filepath: string): Promise<void> {
    await unlink(filepath);
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
