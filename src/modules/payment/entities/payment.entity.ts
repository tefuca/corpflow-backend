import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from '../project/entities/project.entity';
import { Execution } from '../execution/entities/execution.entity';

// Add this enum if it doesn't exist elsewhere
export enum PaymentFlowType {
  VENDOR_AP = 'vendor_ap',
  DAP_COMMISSION = 'dap_commission',
  CLIENT_AR = 'client_ar',
  PAYROLL = 'payroll',
}

export enum PaymentStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  WIRE = 'wire',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other',
}

export enum PaymentCategory {
  SALARY = 'salary',
  VENDOR = 'vendor',
  REIMBURSEMENT = 'reimbursement',
  GRANT = 'grant',
  ADVANCE = 'advance',
  MILESTONE = 'milestone',
  OPERATIONAL = 'operational',
  OTHER = 'other',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  paymentCode: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.DRAFT })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentCategory, default: PaymentCategory.OTHER })
  category: PaymentCategory;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  localAmount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'uuid', nullable: true })
  payeeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payeeName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payeeBankName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payeeBankAccount: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payeeBankSwift: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.payments, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'uuid', nullable: true })
  budgetId: string;

  @Column({ type: 'uuid', nullable: true })
  activityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'date', nullable: true })
  invoiceDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoiceUrl: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid' })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Properties needed by unified-payment.service.ts
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  paymentNumber: string;

  @Column({ type: 'enum', enum: PaymentFlowType, nullable: true })
  flowType: PaymentFlowType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  executedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  journalEntryId: string;

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenter: string;

  @OneToMany(() => Execution, (execution) => execution.payment)
  executions: Execution[];
}
