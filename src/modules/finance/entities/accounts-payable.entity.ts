import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ApStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PAID = 'PAID',
  PARTIAL_PAID = 'PARTIAL_PAID',
}

@Entity('accounts_payable')
export class AccountsPayable extends BaseEntity {
  @Column({ name: 'ap_code', length: 50, unique: true })
  apCode: string;

  @Column({ name: 'vendor_id', nullable: true })
  vendorId: number | null;

  @Column({ name: 'dap_id', nullable: true })
  dapId: number | null;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: number | null;

  @Column({ name: 'reference_type', length: 50 })
  referenceType: string;

  @Column({ name: 'reference_id' })
  referenceId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balanceDue: number;

  @Column({
    type: 'enum',
    enum: ApStatus,
    default: ApStatus.PENDING,
  })
  status: ApStatus;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'scheduled_payment_date', type: 'date', nullable: true })
  scheduledPaymentDate: Date | null;

  @Column({ name: 'gl_posted', type: 'boolean', default: false })
  glPosted: boolean;

  @Column({ name: 'journal_id', nullable: true })
  journalId: number | null;
}
