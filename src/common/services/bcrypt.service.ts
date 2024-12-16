import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      throw new BadRequestException(
        'Password and hashed password are required',
      );
    }
    return bcrypt.compare(password, hashedPassword);
  }
}
