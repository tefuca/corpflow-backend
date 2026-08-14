import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFICATION = 'verification',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  WIRE = 'wire',
}

export enum PaymentCategory {
  VENDOR_AP = 'vendor_ap',
  DAP_COMMISSION = 'dap_commission',
  CLIENT_AR = 'client_ar',
  PAYROLL = 'payroll',
  MILESTONE = 'milestone',
  OPERATIONAL = 'operational',
}

export enum PaymentFlowType {
  VENDOR_AP = 'vendor_ap',
  DAP_COMMISSION = 'dap_commission',
  CLIENT_AR = 'client_ar',
  PAYROLL = 'payroll',
  MILESTONE_BILLING = 'milestone_billing',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentNumber: string;

  @Column()
  payeeId: string;

  @Column()
  payeeName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentCategory,
    nullable: true,
  })
  category: PaymentCategory | null;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  bankAccountId: string | null;

  @Column({ nullable: true })
  referenceNumber: string | null;

  @Column({ nullable: true })
  projectId: string | null;

  @ManyToOne(() => Project, (project) => project.payments, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({
    type: 'enum',
    enum: PaymentFlowType,
    nullable: true,
  })
  flowType: PaymentFlowType | null;

  @Column({ nullable: true })
  referenceType: string | null;

  @Column({ nullable: true })
  referenceId: string | null;

  @Column({ nullable: true })
  verifiedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verifiedAt: Date | null;

  @Column({ nullable: true })
  approvedById: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  approvedAt: Date | null;

  @Column({ nullable: true })
  executedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  executedAt: Date | null;

  @Column({ nullable: true })
  journalEntryId: string | null;

  @Column({ nullable: true })
  costCenter: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
