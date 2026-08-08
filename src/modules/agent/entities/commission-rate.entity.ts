import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('commission_rates')
export class CommissionRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dapId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  enrollmentBonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  trainingBonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  activationCommission: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  transactionRate: number;

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;
}
