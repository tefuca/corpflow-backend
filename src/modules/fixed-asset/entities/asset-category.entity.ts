import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('asset_categories')
export class AssetCategory { @PrimaryGeneratedColumn('uuid') id: string; @Column() name: string; }
