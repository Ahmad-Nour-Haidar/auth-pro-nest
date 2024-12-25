import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { LocalFileService } from './services/local-file.service';

@Module({
  controllers: [FileManagerController],
  providers: [LocalFileService, FileManagerService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
