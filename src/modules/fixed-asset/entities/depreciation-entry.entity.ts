import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('depreciation_entries')
export class DepreciationEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assetId: string;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  depreciationAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  openingValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  closingValue: number;

  @Column({ default: false })
  posted: boolean;
}