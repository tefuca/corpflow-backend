import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXECUTE = 'execute',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  @Column()
  action: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  details: string;

  @CreateDateColumn()
  createdAt: Date;

  // Reverse relation placeholders (not actual TypeORM relations)
  // These satisfy the entity references without requiring circular imports
  activity?: any;
  execution?: any;
  payment?: any;
  project?: any;
}