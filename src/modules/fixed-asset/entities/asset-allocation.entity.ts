import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('asset_allocations')
export class AssetAllocation { @PrimaryGeneratedColumn('uuid') id: string; @Column() fixedAssetId: string; }
