import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('three_way_matches')
export class ThreeWayMatch { @PrimaryGeneratedColumn('uuid') id: string; @Column() poId: string; }
