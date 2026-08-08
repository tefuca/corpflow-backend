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

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, UserRole, SystemFunction, RolePermission]),
  ],
  providers: [RbacService, PermissionGuard],
  controllers: [RbacController],
  exports: [RbacService, PermissionGuard],
})
export class RbacModule {}
