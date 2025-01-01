import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class WithDeletedMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'GET') {
      req['withDeleted'] = req.query.withDeleted?.toString() === 'true'; // Attach the flag to the request object
    }
    next();
  }
}
