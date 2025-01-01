import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { FindOptionsOrder } from 'typeorm';

export const SortingParams = createParamDecorator(
  <T>(
    validParams: string[] = [],
    ctx: ExecutionContext,
  ): FindOptionsOrder<T> => {
    const req: Request = ctx.switchToHttp().getRequest();
    return _handle<T>({
      query: req.query,
      validParams,
    });
  },
);

export function parseSorting<T>({
  query,
  validParams = [],
}: {
  query: Record<string, any>;
  validParams?: string[];
}): FindOptionsOrder<T> {
  return _handle({
    query,
    validParams,
  });
}

function _handle<T>({
  query,
  validParams = [],
}: {
  query: Record<string, any>;
  validParams?: string[];
}): FindOptionsOrder<T> {
  let sort = query.sort;

  // If no sort parameter is provided, return an empty object
  if (!sort) return {};

  // Handle cases where multiple sort parameters are passed (e.g., ?sort=a:asc&sort=b:desc)
  if (Array.isArray(sort)) {
    sort = sort.join(',');
  }

  // Ensure sort is a string
  if (typeof sort !== 'string') {
    throw new BadRequestException(
      'Invalid sort format: expected a String or an Array.',
    );
  }

  // Validate the `validParams` argument
  if (validParams.some((param) => typeof param !== 'string')) {
    throw new BadRequestException('Invalid validParams configuration.');
  }
  validParams.push('created_at'); // Include a default valid property for sorting

  // Split the sort query into individual sort instructions
  const sortEntries = sort.split(',').map((entry) => {
    const [directionRaw, property] = entry.split(':');

    // Ensure the sort entry is correctly formatted
    if (!property || !directionRaw) {
      throw new BadRequestException(`Invalid sort parameter: ${entry}`);
    }

    // Normalize direction to lowercase and validate
    const direction = directionRaw.toLowerCase();
    if (!['asc', 'desc'].includes(direction)) {
      throw new BadRequestException(
        `Invalid sort direction for '${property}': '${directionRaw}'. Allowed values are 'asc' or 'desc'.`,
      );
    }

    // Validate the property name against the allowed parameters
    if (!validParams.includes(property)) {
      throw new BadRequestException(`Invalid sort property: '${property}'.`);
    }

    return [property, direction] as [string, 'asc' | 'desc'];
  });

  // Construct the FindOptionsOrder object and ensure no duplicate properties
  const sortObject: FindOptionsOrder<T> = {};
  for (const [property, direction] of sortEntries) {
    if (sortObject[property as keyof T]) {
      throw new BadRequestException(
        `Duplicate sort property detected: '${property}'.`,
      );
    }
    sortObject[property] = direction;
  }

  delete query.sort;

  return sortObject;
}
