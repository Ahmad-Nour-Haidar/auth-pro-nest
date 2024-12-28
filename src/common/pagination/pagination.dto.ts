import { IsNumber, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  page: number;

  @IsNumber()
  @IsPositive()
  limit: number;

  @IsNumber()
  @IsPositive()
  skip: number;
}
