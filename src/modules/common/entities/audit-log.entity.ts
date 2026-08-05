import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @Column({ name: 'action', length: 50 })
  action: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: number | null;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any> | null;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
