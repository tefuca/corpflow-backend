import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('commission_records')
export class CommissionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  commissionNumber: string;

  @Column({ type: 'uuid' })
  dapId: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @Column()
  commissionType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  holdReason: string;

  @Column({ type: 'date', nullable: true })
  periodStart: Date;

  @Column({ type: 'date', nullable: true })
  periodEnd: Date;

  @Column({ type: 'text', nullable: true })
  calculationBasis: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;
}
