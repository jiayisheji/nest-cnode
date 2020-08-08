import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    return of(request.isAuthenticated() && request.user['is_admin']).pipe(
      tap(value => {
        if (value) {
          throw new ForbiddenException('对不起，你不是管理员', 'AdminGuard');
        }
      }),
    );
  }
}
