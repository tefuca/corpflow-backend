import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('purchase_requisitions')
export class PurchaseRequisition { @PrimaryGeneratedColumn('uuid') id: string; @Column() requestDate: Date; }
