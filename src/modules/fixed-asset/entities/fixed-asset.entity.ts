import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

export enum AssetStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
  UNDER_MAINTENANCE = 'under_maintenance',
  RETIRED = 'retired',
}

@Entity('fixed_assets')
export class FixedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  assetCode: string;

  @Column()
  assetTag: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  purchaseCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  depreciationRate: number;

  @Column({
    type: 'enum',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  salvageValue: number;

  @Column({ type: 'int', default: 5 })
  usefulLifeYears: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulatedDepreciation: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netBookValue: number;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ nullable: true })
  locationId: string | null;

  @Column({ nullable: true })
  departmentId: string | null;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
