import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import * as uuid from 'uuid';

export const UUIDV4Param = createParamDecorator(
  (data: string = 'id', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const param = request.params[data];

    if (uuid.validate(param) && uuid.version(param) === 4) {
      return param;
    }

    throw new BadRequestException(`${data} must be a valid UUID V4`);
  },
);
