import { Repository, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { PaginationDto } from './pagination.dto'; // Assuming you have a PaginationDto

export class PaginateParams<Entity> {
  repository: Repository<Entity>; // The repository to perform operations on
  paginationDto: PaginationDto; // The pagination details
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]; // The filters for the query
  sorting?: FindOptionsOrder<Entity>; // The sorting for the query
}
