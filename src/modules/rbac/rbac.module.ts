import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './services/rbac.service';
import { RbacController } from './controllers/rbac.controller';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { SystemFunction } from './entities/system-function.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { SeedService } from './services/seed.service';

@Module({
  imports: [
   imports: [TypeOrmModule.forFeature([Role, SystemFunction, RolePermission, UserRole])],
  providers: [RbacService, SeedService],
  exports: [RbacService, SeedService],
})
export class RbacModule {}
