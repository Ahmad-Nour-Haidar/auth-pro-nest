import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
  /**
   * Generate a random alphanumeric string of a given length.
   * @param length The desired length of the string.
   * @returns A random alphanumeric string.
   */
  getRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
  }

  /**
   * Generate a random numeric string of a given length.
   * @param length The desired length of the numeric string (default is 6).
   * @returns A random numeric string.
   */
  getRandomNumericString(length: number = 6): string {
    const numbers = '0123456789';
    let numericString = '';
    for (let i = 0; i < length; i++) {
      numericString += numbers.charAt(
        Math.floor(Math.random() * numbers.length),
      );
    }
    return numericString;
  }

  /**
   * Generate a timestamp-based random string with optional prefix.
   * @param length The length of the random portion of the string.
   * @returns A timestamp-based random string.
   */
  getTimestampBasedString(length: number): string {
    const timestamp = Date.now().toString(); // Milliseconds since 1970
    const randomPart = this.getRandomString(length);
    return `${timestamp}-${randomPart}`;
  }
}
