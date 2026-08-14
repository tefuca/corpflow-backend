import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('stock_issues')
export class StockIssue { @PrimaryGeneratedColumn('uuid') id: string; @Column() projectId: string; @Column('decimal') quantity: number; }
