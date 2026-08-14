import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext) { return true; }
}
