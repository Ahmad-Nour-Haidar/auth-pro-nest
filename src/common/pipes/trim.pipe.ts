import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((key) => {
        console.log(key);
        console.log(typeof value[key]);
        if (typeof value[key] === 'string') {
          value[key] = value[key].trim();
        }
        // Recursively trim nested objects
        if (typeof value[key] === 'object') {
          value[key] = this.transform(value[key], metadata);
        }
      });
    }
    return value;
  }
}
