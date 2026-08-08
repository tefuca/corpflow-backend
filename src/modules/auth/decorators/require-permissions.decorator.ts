import { SetMetadata } from '@nestjs/common';
export const PERMISSIONS_KEY = 'permissions';
export type PermissionTuple = [string, string];
export const RequirePermissions = (...permissions: PermissionTuple[]) => SetMetadata(PERMISSIONS_KEY, permissions);
