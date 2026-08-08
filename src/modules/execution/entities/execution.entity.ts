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
import { Payment } from '../payment/entities/payment.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
  CANCELLED = 'cancelled',
}

export enum ExecutionType {
  SINGLE = 'single',
  BULK = 'bulk',
  BATCH = 'batch',
  SCHEDULED = 'scheduled',
}

@Entity('executions')
export class Execution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  executionCode: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Column({ type: 'enum', enum: ExecutionType, default: ExecutionType.SINGLE })
  executionType: ExecutionType;

  @Column({ type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => forwardRef(() => Payment), (payment) => payment.executions)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'date' })
  executionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  processorReference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankReference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionReference: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'text', nullable: true })
  rollbackReason: string;

  @Column({ type: 'timestamp', nullable: true })
  rolledBackAt: Date;

  @Column({ type: 'uuid', nullable: true })
  rolledBackById: string;

  @Column({ type: 'simple-json', nullable: true })
  executionDetails: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  responseData: Record<string, any>;

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
}
