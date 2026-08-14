import { SetMetadata } from '@nestjs/common';
export const REQUIRE_PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...args: any[]) => SetMetadata(REQUIRE_PERMISSIONS_KEY, args);
