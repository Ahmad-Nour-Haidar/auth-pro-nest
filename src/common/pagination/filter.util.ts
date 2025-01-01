import {
  Between,
  Equal,
  ILike,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  FindOptionsWhere,
  Like,
  ArrayOverlap,
} from 'typeorm';
import { FindOperator } from 'typeorm/find-options/FindOperator';
import { BadRequestException } from '@nestjs/common';

export type CustomOptionHandler = {
  handler?: <T>(key: string, value: any) => FindOperator<T>;
  parser?: (value: any) => any;
};

export type FieldTypeObject = {
  type: FieldType;
  enum?: (string | number)[] | object; // Validate parsed value against the enum
};

export type FieldType =
  | 'number'
  | 'integer'
  | 'float'
  | 'string'
  | 'boolean'
  | 'date'
  | 'array'
  | 'enum';

export enum TypeOrmFindOptions {
  eq = 'eq',
  like = 'like',
  ilike = 'ilike',
  gte = 'gte',
  lte = 'lte',
  gt = 'gt',
  lt = 'lt',
  between = 'between',
}

export function parseTypeOrmFilters<Entity>({
  query,
  allowedFields = {},
  customHandlers = {},
}: {
  query: Record<string, any>;
  allowedFields?: Record<string, FieldType | FieldTypeObject>;
  customHandlers?: Record<string, CustomOptionHandler>;
}): FindOptionsWhere<Entity> {
  allowedFields.created_at = 'date';

  const tryParse = (key: string, value: any, fieldType: FieldType) => {
    const parser =
      customHandlers[key]?.parser ?? getParserForFieldType(fieldType);
    const parsedValue = parser(value);
    if (parsedValue === null || parsedValue === undefined) {
      throw new BadRequestException(`Invalid value for key "${key}": ${value}`);
    }
    return parsedValue;
  };

  const checkFindOptions = (
    key: string,
    operator: string,
    fieldType: FieldType,
  ) => {
    if (fieldType === 'string') return;
    if (
      [TypeOrmFindOptions.like, TypeOrmFindOptions.ilike].includes(
        operator as TypeOrmFindOptions,
      )
    ) {
      throw new BadRequestException(
        `Operator "${operator}" is only valid for string fields.`,
      );
    }
  };

  const filters: FindOptionsWhere<Entity> = {};

  for (const [key, value] of Object.entries(query)) {
    const fieldDef = allowedFields[key];
    if (!fieldDef) continue; // Ignore unallowed fields

    const fieldType =
      typeof fieldDef === 'object' ? fieldDef.type : (fieldDef as FieldType);

    // Parse operator and raw value
    const [operator, rawValue] = parseOperatorAndValue(value);
    console.log('fieldDef = ', fieldDef);

    // Custom handler
    if (customHandlers[key]?.handler) {
      filters[key] = customHandlers[key].handler(
        key,
        tryParse(key, rawValue, fieldType),
      );
      continue;
    }

    // Check operator validity and assign filters
    checkFindOptions(key, operator, fieldType);

    console.log('fieldType = ', fieldType);
    if (fieldType === 'array' || fieldType === 'enum') {
      const parsedValue = tryParse(key, rawValue, fieldType);

      let s: any[];
      if (typeof fieldDef === 'object') {
        s = Object.values(fieldDef.enum);
      }

      // Ensure all elements of parsedValue are within the allowed enum values
      if (
        fieldType === 'enum' &&
        s.length &&
        !parsedValue.every((val: any) => s.includes(val))
      ) {
        console.log('sdsds');
        throw new BadRequestException(
          `Invalid values for key ${key}: ${parsedValue}. Allowed values are: ${s.join(',')}`,
        );
      }

      filters[key] = ArrayOverlap(parsedValue);
    } else {
      filters[key] = assignTypeOrmFilter(
        key,
        operator,
        rawValue,
        fieldType,
        tryParse,
      );
    }

    return filters;
  }
}

function assignTypeOrmFilter(
  key: string,
  operator: string,
  rawValue: string,
  fieldType: FieldType,
  tryParse: (key: string, value: any, fieldType: FieldType) => any,
): FindOperator<any> | null {
  switch (operator.toLowerCase()) {
    case TypeOrmFindOptions.like:
      return Like(`%${tryParse(key, rawValue, fieldType)}%`);
    case TypeOrmFindOptions.ilike:
      return ILike(`%${tryParse(key, rawValue, fieldType)}%`);
    case TypeOrmFindOptions.eq:
      return Equal(tryParse(key, rawValue, fieldType));
    case TypeOrmFindOptions.gt:
      return MoreThan(tryParse(key, rawValue, fieldType));
    case TypeOrmFindOptions.gte:
      return MoreThanOrEqual(tryParse(key, rawValue, fieldType));
    case TypeOrmFindOptions.lt:
      return LessThan(tryParse(key, rawValue, fieldType));
    case TypeOrmFindOptions.lte:
      return LessThanOrEqual(tryParse(key, rawValue, fieldType));
    case TypeOrmFindOptions.between: {
      const { min, max } = getMinMax(key, rawValue);
      return Between(
        tryParse(key, min, fieldType),
        tryParse(key, max, fieldType),
      );
    }
    default:
      throw new BadRequestException(
        `Invalid operator for "${key}": ${operator}`,
      );
  }
}

export function parseOperatorAndValue(input: string): [string, string] {
  const separatorIndex = input.indexOf(':');
  if (separatorIndex === -1) {
    return [TypeOrmFindOptions.eq, input]; // Default operator
  }
  const operator = input.substring(0, separatorIndex);
  const rawValue = input.substring(separatorIndex + 1);
  return [operator, rawValue];
}

export function getMinMax(key: string, rawValue: string) {
  const [min, max] = rawValue.split(',');
  if (!min || !max) {
    throw new BadRequestException(
      `Invalid "between" value for "${key}": ${rawValue}`,
    );
  }
  return { min, max };
}

export function getParserForFieldType(
  fieldType: FieldType,
): (value: string) => any {
  switch (fieldType) {
    case 'number':
    case 'float':
      return (value: string) => {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
      };

    case 'integer':
      return (value: string) => {
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) ? null : parsedValue;
      };

    case 'boolean':
      return (value: string) => {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return null;
      };

    case 'date':
      return (value: string) => {
        const parsedValue = new Date(value);
        return isNaN(parsedValue.getTime()) ? null : parsedValue;
      };

    case 'string':
      return (value: string) => value;

    case 'array':
    case 'enum':
      return (value: string) => {
        return value.toString().split(',');
      };

    default:
      return (value: any) => value;
  }
}
