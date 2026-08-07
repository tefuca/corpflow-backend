import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Client } from './client.entity';
import { ClientInvoiceLine } from './client-invoice-line.entity';

export enum ClientInvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL_PAID = 'PARTIAL_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity('client_invoices')
export class ClientInvoice extends BaseEntity {
  @Column({ name: 'invoice_number', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ name: 'client_id' })
  clientId: number;

  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'project_id', nullable: true })
  projectId: number | null;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balanceDue: number;

  @Column({
    type: 'enum',
    enum: ClientInvoiceStatus,
    default: ClientInvoiceStatus.DRAFT,
  })
  status: ClientInvoiceStatus;

  @Column({ name: 'milestone_id', nullable: true })
  milestoneId: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

   @OneToMany(() => ClientInvoiceLine, (line) => line.invoice)
  lines: ClientInvoiceLine[];
}
