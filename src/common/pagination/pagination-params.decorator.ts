import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Default Pagination Values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_MIN_LIMIT = 5;
const DEFAULT_MAX_LIMIT = 15;

export interface PaginationData {
  page: number;

  limit: number;

  skip: number;
}

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): PaginationData => {
    const req: Request = ctx.switchToHttp().getRequest();

    return _handle(req.query);
  },
);

export function parsePagination(query?: Record<string, any>): PaginationData {
  return _handle(query);
}

function _handle(query: Record<string, any> = {}): PaginationData {
  // Parse and validate page
  const page = Math.max(
    parseInt(query.page?.toString(), 10) || DEFAULT_PAGE,
    DEFAULT_PAGE,
  );

  // Parse and validate limit
  const limit = Math.min(
    Math.max(
      parseInt(query.limit?.toString(), 10) || DEFAULT_LIMIT,
      DEFAULT_MIN_LIMIT,
    ),
    DEFAULT_MAX_LIMIT,
  );

  delete query?.page;
  delete query?.limit;

  return { page, limit, skip: (page - 1) * limit };
}
