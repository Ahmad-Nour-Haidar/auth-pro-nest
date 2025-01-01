import { FindOptionsWhere, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from './base.entity';
import { parsePagination } from '../pagination/pagination-params.decorator';
import {
  FieldType,
  FieldTypeObject,
  parseTypeOrmFilters,
} from '../pagination/filter.util';
import { paginate } from '../pagination/paginate.function';
import { parseSorting } from '../pagination/sort-params.decorator';
import { CustomI18nService } from '../services/custom-i18n.service';
import { TranslationKeys } from '../../i18n/translation-keys';

@Injectable()
export class GenericRepository<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  @Inject() private readonly i18n_: CustomI18nService;

  // Find all entities
  async find_all({
    query = {},
    allowedFields,
    filterDeveloper,
  }: {
    query?: Record<string, any>;
    allowedFields?: Partial<Record<keyof T, FieldType | FieldTypeObject>>;
    filterDeveloper?: FindOptionsWhere<T>;
  }) {
    let validParams: string[] = [];

    const withDeleted: boolean = query.withDeleted ?? false;
    delete query.withDeleted;

    if (allowedFields) {
      validParams = Object.keys(allowedFields);
    }

    const sorting = parseSorting<T>({
      query,
      validParams,
    });

    const paginationData = parsePagination(query);

    const where = parseTypeOrmFilters<T>({
      query,
      allowedFields,
    });

    return paginate<T>({
      repository: this.repository,
      paginationData,
      where: { ...where, ...filterDeveloper },
      sorting,
      withDeleted,
    });
  }

  // Find one entity by ID
  async get_one({
    id,
    throwIfNull = true,
    withDeleted = false,
  }: {
    id: string;
    throwIfNull?: boolean;
    withDeleted?: boolean;
  }): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      withDeleted: withDeleted, // Include soft-deleted records if true
    });
    if (!entity && throwIfNull) {
      throw new NotFoundException(this.notFoundMsg(id));
    }
    return entity;
  }

  // Soft delete an entity by ID
  async soft_delete(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(
        `${this.repository.metadata.name} with ID ${id} not found`,
      );
    }
  }

  // Hard delete an entity by ID
  async hard_delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(
        `${this.repository.metadata.name} with ID ${id} not found`,
      );
    }
  }

  // Restore a soft-deleted entity
  async restore_entity(id: string): Promise<void> {
    const result = await this.repository.restore(id);
    if (!result.affected) {
      throw new NotFoundException(this.notFoundMsg(id));
    }
  }

  private notFoundMsg(id: any): string {
    return this.i18n_.tr(TranslationKeys.entity_not_found, {
      args: { id, name: this.repository.metadata.name },
    });
  }
}
