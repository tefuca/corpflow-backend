import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { RolePermission } from './role-permission.entity';

export enum FunctionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('system_functions')
@Index(['functionCode'], { unique: true })
export class SystemFunction extends BaseEntity {
  @Column({ name: 'function_code', length: 100, unique: true })
  functionCode: string;

  @Column({ name: 'function_name', length: 150 })
  functionName: string;

  @Column({ name: 'parent_function', length: 100, nullable: true })
  parentFunction: string | null;

  @Column({ name: 'menu_path', length: 255, nullable: true })
  menuPath: string | null;

  @Column({ name: 'icon_class', length: 50, default: 'bi bi-file' })
  iconClass: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_menu_item', type: 'boolean', default: true })
  isMenuItem: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: FunctionStatus,
    default: FunctionStatus.ACTIVE,
  })
  status: FunctionStatus;

  @OneToMany(() => RolePermission, (rp) => rp.systemFunction, { cascade: true })
  rolePermissions: RolePermission[];
}
