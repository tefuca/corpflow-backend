import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('commission_records')
export class CommissionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  commissionNumber: string;

  @Column()
  dapId: string;

  @Column()
  agentId: string;

  @Column()
  commissionType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  holdReason: string;

  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @Column({ type: 'text', nullable: true })
  calculationBasis: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  paymentReference: string;
}
