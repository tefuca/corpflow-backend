import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './services/seed.service';
import { RbacService } from './services/rbac.service';
import { Role } from './entities/role.entity';
import { SystemFunction } from './entities/system-function.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, SystemFunction, RolePermission, UserRole])],
  providers: [RbacService, SeedService],
  exports: [RbacService, SeedService],
})
export class RbacModule {}
