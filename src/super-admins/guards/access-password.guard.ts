import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPER_ADMIN_ACCESS_PASSWORD } from '../decorators/access-password.decorator';

@Injectable()
export class AccessPasswordGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // const requiresAccessPassword = this.reflector.get<boolean>(
    //   SUPER_ADMIN_ACCESS_PASSWORD,
    //   context.getHandler(),
    // );

    const requiresAccessPassword = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ACCESS_PASSWORD,
      [context.getHandler(), context.getClass()],
    );

    // console.log('requiresAccessPassword', requiresAccessPassword);

    // // Skip if the route doesn't require access password validation
    if (!requiresAccessPassword) return true;

    const request = context.switchToHttp().getRequest();
    const accessPassword = request.headers[SUPER_ADMIN_ACCESS_PASSWORD];

    if (accessPassword !== process.env.SUPER_ADMIN_ACCESS_PASSWORD) {
      throw new ForbiddenException('Access password is incorrect');
    }

    return true;
  }
}
