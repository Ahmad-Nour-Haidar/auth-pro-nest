import {
  FileSizeUnit,
  NonEmptyArray,
  SupportedFileType,
} from '../types/file.types';

export const MaxFileCount = {
  user_cover_image: 1,
  user_profile_image: 1,
} as const satisfies Record<string, number>;

export const DefaultSizeLimits = {
  png: '5MB',
  jpg: '5MB',
  jpeg: '5MB',
  pdf: '5MB',
  mp4: '300MB',
  ogg: '5MB',
} as const satisfies Record<SupportedFileType, FileSizeUnit>;

export const AllowedTypes = {
  // image: ['png', 'jpg', 'jpeg'],
  images: ['png', 'jpg', 'jpeg'],
  videos: ['mp4'],
  audios: ['ogg'],
  documents: ['pdf'],
} as const satisfies Record<string, NonEmptyArray<SupportedFileType>>;

// export const SizeLimits = {
//   images: {
//     png: '5MB',
//     jpg: '5MB',
//     jpeg: '5MB',
//     mp4: '5MB',
//   },
//   videos: {},
// } as const satisfies Record<
//   string,
//   Partial<Record<SupportedFileType, FileSizeUnit>>
// >;
