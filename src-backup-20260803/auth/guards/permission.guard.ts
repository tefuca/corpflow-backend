import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionTuple } from '../decorators/require-permissions.decorator';
import { RbacService } from '../../modules/rbac/services/rbac.service';

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionTuple[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('User not authenticated');

    const superRoles = ['Administrator', 'System Admin', 'Super Admin'];
    if (user.roles?.some((r: string) => superRoles.includes(r))) return true;

    for (const [moduleName, action] of required) {
      const ok = await this.rbacService.checkUserPermission(
        user.sub, moduleName, action as PermissionAction,
      );
      if (!ok) {
        throw new ForbiddenException(
          `Access denied: '${action}' required for '${moduleName}'`,
        );
      }
    }
    return true;
  }
}