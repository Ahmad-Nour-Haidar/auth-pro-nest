export interface FileMetadata {
  size: string;
  mimetype: string;
  originalname: string;
  uniqueName: string;
  path: string;
  url?: string;
}

// export class FileMetadata {
//   constructor(
//     public size: string,
//     public mimetype: string,
//     public originalname: string,
//     public uniqueName: string,
//     public path: string,
//     public url: string,
//   ) {}
//
//   // Example Method
//   getExtension(): string {
//     return this.mimetype.split('/')[1];
//   }
// }
