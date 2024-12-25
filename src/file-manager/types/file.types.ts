export type MulterFile = Express.Multer.File;

export type FileSizeUnit = `${number}${'KB' | 'MB' | 'GB' | 'TB'}`;

export type SupportedFileType = 'png' | 'jpg' | 'jpeg' | 'pdf' | 'mp4' | 'ogg';

export type NonEmptyArray<T> = [T, ...T[]];
