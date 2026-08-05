import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum VoucherStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

@Entity('payment_vouchers')
export class PaymentVoucher extends BaseEntity {
  @Column({ name: 'voucher_number', length: 50, unique: true })
  voucherNumber: string;

  @Column({ name: 'voucher_date', type: 'date' })
  voucherDate: Date;

  @Column({ name: 'payee_name', length: 100 })
  payeeName: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.DRAFT,
  })
  status: VoucherStatus;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account', length: 50, nullable: true })
  bankAccount: string | null;

  @Column({ name: 'cheque_number', length: 50, nullable: true })
  chequeNumber: string | null;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'payment_reference', length: 100, nullable: true })
  paymentReference: string | null;

  @Column({ name: 'gl_posted', type: 'boolean', default: false })
  glPosted: boolean;

  @Column({ name: 'journal_id', nullable: true })
  journalId: number | null;

  @Column({ name: 'cost_center', length: 50, nullable: true })
  costCenter: string | null;

  @Column({ name: 'project_id', nullable: true })
  projectId: number | null;
}
