import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('client_billing_records')
export class ClientBillingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  billingNumber: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column()
  agentId: string;

  @Column()
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
