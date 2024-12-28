import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Sorting {
  [property: string]: 'asc' | 'desc';
}

export const SortingParams = createParamDecorator(
  (validParams: string[] = [], ctx: ExecutionContext): Sorting => {
    const req: Request = ctx.switchToHttp().getRequest();
    let sort = req.query.sort;

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
    validParams.push('created_at');

    // Split the sort query into individual sort instructions
    const sortEntries = sort.split(',').map((entry) => {
      const [property, directionRaw] = entry.split(':');

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

    // Construct the Sorting object and ensure no duplicate properties
    const sortObject: Sorting = {};
    for (const [property, direction] of sortEntries) {
      if (sortObject[property]) {
        throw new BadRequestException(
          `Duplicate sort property detected: '${property}'.`,
        );
      }
      sortObject[property] = direction;
    }

    return sortObject;
  },
);
