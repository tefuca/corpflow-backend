import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('vendor_invoices')
export class VendorInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  poId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.invoices)
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ default: false })
  matchedPo: boolean;

  @Column({ default: false })
  matchedGrn: boolean;

  @Column({ default: false })
  threeWayMatched: boolean;

  @Column({ nullable: true })
  matchedAt: Date;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidAmount: number;
}
