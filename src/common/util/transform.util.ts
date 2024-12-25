import { plainToInstance, ClassConstructor } from 'class-transformer';

export function transformToDto<T, V>(
  dtoClass: ClassConstructor<T>,
  entity: V,
): T {
  return plainToInstance(dtoClass, entity, { excludeExtraneousValues: true });
}
