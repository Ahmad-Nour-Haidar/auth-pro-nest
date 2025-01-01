import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { PaginationData } from './pagination-params.decorator';

export interface PaginateParams<Entity> {
  repository: Repository<Entity>; // The repository to perform operations on
  paginationData: PaginationData; // The pagination details
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]; // The filters for the query
  sorting?: FindOptionsOrder<Entity>; // The sorting for the query
  withDeleted?: boolean;
}

export interface Pagination {
  total: number; // Total items
  limit: number; // Items per page
  page: number; // Current page
  first: number; // Always 1
  last: number; // Last page based on total items and limit
  prev?: number | null; // Previous page if available
  next?: number | null; // Next page if available
}

export interface PaginatedResult<Entity> {
  data: Entity[];
  pagination: Pagination; // Pagination details
}

export async function paginate<Entity>(
  params: PaginateParams<Entity>,
): Promise<PaginatedResult<Entity>> {
  const { repository, paginationData, where, sorting, withDeleted } = params;

  const { page, limit, skip } = paginationData;

  // Fetch data and total count from the repository
  const [data, total] = await repository.findAndCount({
    where,
    order: sorting,
    skip,
    take: limit,
    withDeleted,
  });

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Return paginated result
  return {
    data,
    pagination: {
      total,
      limit,
      page,
      first: 1,
      last: totalPages,
      prev: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
    },
  };
}
