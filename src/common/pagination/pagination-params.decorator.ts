import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PaginationDto } from './pagination.dto';

// Default Pagination Values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 15;

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): PaginationDto => {
    const req: Request = ctx.switchToHttp().getRequest();
    const pageRaw = req.query.page as string;
    const limitRaw = req.query.limit as string;

    // Parse and validate page
    const page = Math.max(parseInt(pageRaw, 10) || DEFAULT_PAGE, DEFAULT_PAGE);

    // Parse and validate limit
    const limit = Math.min(
      Math.max(parseInt(limitRaw, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );

    return { page, limit, skip: (page - 1) * limit };
  },
);
