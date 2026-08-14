import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('vendors')
export class Vendor { @PrimaryGeneratedColumn('uuid') id: string; @Column() name: string; }
