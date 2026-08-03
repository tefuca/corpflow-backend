import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

export enum RoleStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('roles')
@Index(['roleName'], { unique: true })
export class Role extends BaseEntity {
  @Column({ name: 'role_name', length: 100, unique: true })
  roleName: string;

  @Column({ name: 'role_description', length: 255, nullable: true })
  roleDescription: string | null;

  @Column({ name: 'is_system_role', type: 'boolean', default: false })
  isSystemRole: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;

  @OneToMany(() => UserRole, (userRole) => userRole.role, { cascade: true })
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePerm) => rolePerm.role, { cascade: true })
  rolePermissions: RolePermission[];
}
