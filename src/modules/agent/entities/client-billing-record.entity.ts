import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('client_billing_records')
export class ClientBillingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  billingNumber: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => 'Client' as any, (client: any) => client.billingRecords)
  client: any;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @Column({ type: 'uuid' })
  kpiDefinitionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  billingDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ default: 'draft' })
  status: string;
}
