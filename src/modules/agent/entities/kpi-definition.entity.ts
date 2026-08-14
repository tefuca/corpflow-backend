import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CreateDateColumn } from 'typeorm';

export enum KpiType {
  ACTIVATION = 'activation',
  TRANSACTION_VOLUME = 'transaction_volume',
  CUSTOMER_ACQUISITION = 'customer_acquisition',
  RETENTION = 'retention',
}

@Entity('kpi_definitions')
export class KpiDefinition {
  @CreateDateColumn()
  createdAt: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: KpiType })
  kpiType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageRate: number;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}
