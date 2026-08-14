import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchaseOrderId: string;

  @Column()
  description: string;

  @Column('decimal')
  quantity: number;

  @Column('decimal')
  unitPrice: number;

  @ManyToOne(() => 'PurchaseOrder' as any, (po: any) => po.items)
  purchaseOrder: any;
}