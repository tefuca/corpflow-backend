import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity';
import { ClientInvoiceLine } from './client-invoice-line.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('client_invoices')
export class ClientInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ nullable: true })
  projectId: string | null;

  @Column({ nullable: true })
  agentId: string | null;

  @Column({ nullable: true })
  invoiceType: string | null;

  @Column({ nullable: true })
  kpiType: string | null;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ nullable: true })
  paymentStatus: string | null;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // ── Relations ──
  @OneToMany(() => ClientInvoiceLine, (line) => line.invoice)
  lines: ClientInvoiceLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
