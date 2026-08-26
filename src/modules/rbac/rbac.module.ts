import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './services/seed.service';
import { RbacService } from './services/rbac.service';
import { Role } from './entities/role.entity';
import { SystemFunction } from './entities/system-function.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      SystemFunction,
      RolePermission,
      UserRole,
    ]),
  ],
  providers: [RbacService, SeedService],
  exports: [
    RbacService,
    SeedService,
    TypeOrmModule,
  ],
})
export class RbacModule {}
