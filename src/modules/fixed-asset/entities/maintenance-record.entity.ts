import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('maintenance_records')
export class MaintenanceRecord { @PrimaryGeneratedColumn('uuid') id: string; @Column() fixedAssetId: string; }
