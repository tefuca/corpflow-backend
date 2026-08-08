import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum KpiType {
  ACTIVATION = 'activation',
  TRANSACTION_VOLUME = 'transaction_volume',
  CUSTOMER_ACQUISITION = 'customer_acquisition',
  RETENTION = 'retention',
}

@Entity('kpi_definitions')
export class KpiDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: KpiType })
  kpiType: KpiType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageRate: number;

  @Column({ nullable: true })
  projectId: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  description: string;
}
