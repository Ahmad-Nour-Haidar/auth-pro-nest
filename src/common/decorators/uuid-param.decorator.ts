import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { v4 as isUuid } from 'uuid';

export const UUIDParam = createParamDecorator(
  (data: string = 'id', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const param = request.params[data];

    if (!isUuid(param)) {
      throw new BadRequestException(`${data} must be a valid UUID`);
    }

    return param;
  },
);
