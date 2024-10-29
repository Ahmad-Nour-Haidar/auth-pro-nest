import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, body } = req;
    const timestamp = new Date().toISOString();

    // Log the important request information
    this.logger.log(
      `[${timestamp}] ${method} ${url} - Body: ${JSON.stringify(body)}`,
    );

    // Call the next middleware in the stack
    next();
  }
}
