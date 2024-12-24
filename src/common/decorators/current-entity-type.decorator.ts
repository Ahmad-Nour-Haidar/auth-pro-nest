import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EntityTypeEnum } from '../enums/entity-type.enum';

export const CurrentEntityType = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): EntityTypeEnum => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.entity_type; // Assumes `entity_type` is attached to `request.user`
  },
);
