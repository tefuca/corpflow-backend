import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('grns')
export class Grn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchaseOrderId: string;

  @ManyToOne(() => 'PurchaseOrder' as any, (po: any) => po.grns)
  purchaseOrder: any;

  @Column()
  grnNumber: string;

  @Column()
  receivedAt: Date;

  @OneToMany(() => 'GrnItem' as any, (i: any) => i.grn)
  items: any[];
}