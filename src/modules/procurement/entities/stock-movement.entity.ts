import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('stock_movements')
export class StockMovement { @PrimaryGeneratedColumn('uuid') id: string; @Column() stockItemId: string; }
