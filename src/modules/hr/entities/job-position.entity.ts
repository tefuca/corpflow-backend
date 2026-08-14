import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('job_positions')
export class JobPosition { @PrimaryGeneratedColumn('uuid') id: string; @Column() title: string; }
