import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentSchedule } from './payment-schedule.entity';
import { PaymentRequest } from './payment-request.entity';
import { Dap } from '../../agent/entities/dap.entity';


export enum ItemStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid',
}

@Entity('schedule_items')
export class ScheduleItem {
  @Column({ primary: true, generated: 'increment' })
  id: number;

  @ManyToOne(() => PaymentSchedule, (ps) => ps.scheduleItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: PaymentSchedule;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @ManyToOne(() => PaymentRequest, (pr) => pr.scheduleItems, { nullable: true })
  @JoinColumn({ name: 'payment_request_id' })
  paymentRequest: PaymentRequest | null;

  @Column({ name: 'payment_request_id', nullable: true })
  paymentRequestId: number | null;

  @ManyToOne(() => Dap, { nullable: true })
  @JoinColumn({ name: 'dap_id' })
  dap: Dap | null;

  @Column({ name: 'dap_id', type: 'uuid', nullable: true })
  dapId: string | null;

  @Column({ name: 'payment_description', type: 'text', nullable: true })
  paymentDescription: string | null;

  @Column({ name: 'rate_type', length: 50, nullable: true })
  rateType: string | null;

  @Column({ name: 'rate_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  rateValue: number | null;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ name: 'base_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  baseAmount: number | null;

  @Column({ name: 'item_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  itemAmount: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.PENDING,
  })
  status: ItemStatus;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}