import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Grn } from './grn.entity';
import { VendorInvoice } from './vendor-invoice.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  poNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @OneToMany(() => PurchaseOrderItem, (item) => (item as any).purchaseOrder)
  items: PurchaseOrderItem[];

  @OneToMany(() => Grn, (grn) => (grn as any).purchaseOrder)
  grns: Grn[];

  @OneToMany(() => VendorInvoice, (inv) => inv.purchaseOrder)
  invoices: VendorInvoice[];
}
