import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('kpi_achievements')
export class KpiAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @Column()
  kpiDefinitionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualValue: number;

  @Column({ type: 'date' })
  measuredDate: Date;

  @Column({ type: 'date', nullable: true })
  measurementPeriodStart: Date;

  @Column({ type: 'date', nullable: true })
  measurementPeriodEnd: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  billedAmount: number;

  @Column({ default: false })
  billed: boolean;

  @Column({ nullable: true })
  invoiceId: string;
}
