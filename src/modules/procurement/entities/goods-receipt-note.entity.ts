import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('goods_receipt_notes')
export class GoodsReceiptNote { @PrimaryGeneratedColumn('uuid') id: string; @Column() grnNumber: string; }
