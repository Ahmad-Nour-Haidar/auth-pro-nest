import { PaginateParams } from './paginate.param';

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
  const { repository, paginationDto, where, sorting } = params;

  // If paginationDto is undefined or null, no pagination logic should be applied
  if (!paginationDto) {
    const data = await repository.find({ where, order: sorting });
    const total = data.length;

    return {
      data,
      pagination: {
        total,
        limit: total, // No pagination applied
        page: 1, // Only 1 page
        first: 1,
        last: 1,
      },
    };
  }

  const { page, limit, skip } = paginationDto;

  // Fetch data and total count from the repository
  const [data, total] = await repository.findAndCount({
    where,
    order: sorting,
    skip,
    take: limit,
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
