import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ApStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
}

@Entity('accounts_payable')
export class AccountsPayable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: ApStatus,
    default: ApStatus.PENDING,
  })
  status: ApStatus;

  @Column({ nullable: true })
  paymentStatus: string | null;

  // ── Three-way match fields ──
  @Column({ nullable: true })
  poId: string | null;

  @Column({ default: false })
  matchedPo: boolean;

  @Column({ default: false })
  matchedGrn: boolean;

  @Column({ default: false })
  threeWayMatched: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  matchedAt: Date | null;

  @Column({ nullable: true })
  grnId: string | null;

  @Column({ nullable: true })
  vendorId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
