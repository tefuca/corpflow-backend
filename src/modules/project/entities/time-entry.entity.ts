import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('time_entries')
export class TimeEntry { @PrimaryGeneratedColumn('uuid') id: string; @Column() userId: string; @Column() hours: number; }
