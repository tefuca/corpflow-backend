import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('stock_items')
export class StockItem { @PrimaryGeneratedColumn('uuid') id: string; @Column() sku: string; }
