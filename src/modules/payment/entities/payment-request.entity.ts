import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Agent } from './agent.entity';
import { Dap } from './dap.entity';
import { ActivityType } from './activity-type.entity';
import { ScheduleItem } from './schedule-item.entity';

export enum PaymentRequestStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  IN_SCHEDULE = 'In Schedule',
  PAID = 'Paid',
  REJECTED = 'Rejected',
}

export enum PaymentCategory {
  DAP = 'DAP',
  NON_DAP = 'Non-DAP',
}

@Entity('payment_requests')
export class PaymentRequest extends BaseEntity {
  @Column({ name: 'request_code', length: 50, unique: true })
  requestCode: string;

  @ManyToOne(() => Agent, (agent) => agent.paymentRequests, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent | null;

  @Column({ name: 'agent_id', nullable: true })
  agentId: number | null;

  @ManyToOne(() => Dap, (dap) => dap.paymentRequests, { nullable: true })
  @JoinColumn({ name: 'dap_id' })
  dap: Dap | null;

  @Column({ name: 'dap_id', nullable: true })
  dapId: number | null;

  @ManyToOne(() => ActivityType, (at) => at.paymentRequests, { nullable: true })
  @JoinColumn({ name: 'activity_type_id' })
  activityType: ActivityType | null;

  @Column({ name: 'activity_type_id', nullable: true })
  activityTypeId: number | null;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ name: 'requested_by', type: 'int' })
  requestedBy: number;

  @Column({ name: 'request_date', type: 'date' })
  requestDate: Date;

  @Column({ name: 'period_from', type: 'date', nullable: true })
  periodFrom: Date | null;

  @Column({ name: 'period_to', type: 'date', nullable: true })
  periodTo: Date | null;

  @Column({ name: 'schedule_type', length: 50, nullable: true })
  scheduleType: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentRequestStatus,
    default: PaymentRequestStatus.DRAFT,
  })
  status: PaymentRequestStatus;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string | null;

  @Column({
    name: 'payment_category',
    type: 'enum',
    enum: PaymentCategory,
    default: PaymentCategory.DAP,
  })
  paymentCategory: PaymentCategory;

  @OneToMany(() => ScheduleItem, (si) => si.paymentRequest)
  scheduleItems: ScheduleItem[];
}
