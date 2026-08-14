import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRE_PERMISSION_KEY,
} from '../../rbac/decorators/require-permission.decorator';
import { RbacService } from '../../rbac/services/rbac.service';

type PermissionTuple = [string, string];

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionTuple>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const [resource, action] = required;

    // Cast action to any since RbacService may have a restrictive type
    const hasPermission = await this.rbacService.checkUserPermission(
      user.id,
      resource,
      action as any,   // <-- FIXED: cast to any
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: ${resource}:${action}`,
      );
    }

    return true;
  }
}
