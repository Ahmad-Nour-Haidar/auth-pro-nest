import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { LocalFileService } from './services/local-file.service';
import { FileUrlService } from './services/file-url.service';

@Module({
  controllers: [FileManagerController],
  providers: [FileManagerService, LocalFileService, FileUrlService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
