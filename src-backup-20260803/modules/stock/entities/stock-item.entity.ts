import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum StockItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPLETED = 'depleted',
}

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  itemCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorderLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: StockItemStatus,
    default: StockItemStatus.ACTIVE,
  })
  status: StockItemStatus;

  @Column({ type: 'simple-json', nullable: true })
  projectAllocations: string[];

  @Column({ type: 'int', nullable: true })
  createdById: number;

  @Column({ type: 'int', nullable: true })
  updatedById: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}