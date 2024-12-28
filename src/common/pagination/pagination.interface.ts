import { PaginationDto } from './pagination.dto';
import { Sorting } from './sort-params.decorator';
import { FindOptionsWhere } from 'typeorm';

export class FindAllQuery<Entity> {
  paginationDto: PaginationDto;
  sorting?: Sorting;
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]; // The filters for the query
}
