import { Injectable } from '@nestjs/common';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class LocalFileService {
  private readonly uploadPath = './uploads'; // Configure as needed

  async saveFile(filename: string, data: Buffer): Promise<string> {
    const path = join(this.uploadPath, filename);
    await writeFile(path, data);
    return path;
  }

  async deleteFile(filepath: string): Promise<void> {
    await unlink(filepath);
  }
}
