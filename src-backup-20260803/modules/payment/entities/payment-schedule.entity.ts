import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ScheduleItem } from './schedule-item.entity';

export enum ScheduleStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid',
}

export enum ScheduleType {
  WEEKLY = 'Weekly',
  BI_WEEKLY = 'Bi-Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  BI_ANNUAL = 'Bi-Annual',
  ANNUAL = 'Annual',
  ONE_TIME = 'One-time',
}

@Entity('payment_schedules')
export class PaymentSchedule extends BaseEntity {
  @Column({ name: 'schedule_code', length: 50, unique: true })
  scheduleCode: string;

  @Column({ name: 'schedule_period', length: 50 })
  schedulePeriod: string;

  @Column({
    name: 'schedule_type',
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.MONTHLY,
  })
  scheduleType: ScheduleType;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'dap_count', type: 'int', default: 0 })
  dapCount: number;

  @Column({ name: 'request_count', type: 'int', default: 0 })
  requestCount: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.DRAFT,
  })
  status: ScheduleStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'approved_by', type: 'int', nullable: true })
  approvedBy: number | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @OneToMany(() => ScheduleItem, (si) => si.schedule, { cascade: true })
  scheduleItems: ScheduleItem[];
}
