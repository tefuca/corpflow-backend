import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('po_items')
export class PoItem { @PrimaryGeneratedColumn('uuid') id: string; @Column() purchaseOrderId: string; }
