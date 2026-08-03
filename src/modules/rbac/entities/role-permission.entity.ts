import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Role } from './role.entity';
import { SystemFunction } from './system-function.entity';

@Entity('role_permissions')
@Index(['roleId', 'functionId'], { unique: true })
export class RolePermission extends BaseEntity {
  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @Column({ name: 'function_id', type: 'int' })
  functionId: number;

  @Column({ name: 'no_access', type: 'boolean', default: true })
  noAccess: boolean;

  @Column({ name: 'can_view', type: 'boolean', default: false })
  canView: boolean;

  @Column({ name: 'can_add', type: 'boolean', default: false })
  canAdd: boolean;

  @Column({ name: 'can_edit', type: 'boolean', default: false })
  canEdit: boolean;

  @Column({ name: 'can_delete', type: 'boolean', default: false })
  canDelete: boolean;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => SystemFunction, (func) => func.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'function_id' })
  systemFunction: SystemFunction;
}