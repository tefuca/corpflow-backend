import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { UserRole } from './user-role.entity';

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  LOCKED = 'Locked',
}

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'email', length: 100, unique: true })
  email: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'gender', length: 20, nullable: true })
  gender: string | null;

  @Column({ name: 'region', length: 50, nullable: true })
  region: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
  userRoles: UserRole[];
}
