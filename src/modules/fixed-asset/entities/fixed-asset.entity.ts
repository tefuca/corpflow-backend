import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AssetStatus {
  ACTIVE = 'active',
  UNDER_MAINTENANCE = 'under_maintenance',
  DISPOSED = 'disposed',
  IDLE = 'idle',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

@Entity('fixed_assets')
export class FixedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  assetCode: string;

  @Column({ length: 255 })
  assetName: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 100, nullable: true })
  subCategory?: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  purchaseCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentValue: number;

  @Column({
    type: 'enum',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @Column({ type: 'int', default: 5 })
  usefulLifeYears: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  salvageValue: number;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ length: 100, nullable: true })
  department?: string;

  @Column({ length: 255, nullable: true })
  assignedTo?: string;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ length: 255, nullable: true })
  vendor?: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ length: 36, nullable: true })
  createdBy: string;

  @Column({ length: 36, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}