import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ClientInvoice } from './client-invoice.entity';

@Entity('client_payments')
export class ClientPayment extends BaseEntity {
  @Column({ name: 'payment_reference', length: 100, unique: true })
  paymentReference: string;

  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @ManyToOne(() => ClientInvoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: ClientInvoice;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'bank_reference', length: 100, nullable: true })
  bankReference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'reconciled', type: 'boolean', default: false })
  reconciled: boolean;

  @Column({ name: 'reconciled_by', nullable: true })
  reconciledBy: number | null;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt: Date | null;
}
