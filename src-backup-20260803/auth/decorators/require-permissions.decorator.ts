import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export type PermissionTuple = [string, string];

/**
 * Usage:
 *   @RequirePermissions(['MODULE_CODE', 'action'])
 *   @RequirePermissions(['PAYMENT', 'view'], ['PAYMENT', 'edit'])
 */
export const RequirePermissions = (...permissions: PermissionTuple[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);