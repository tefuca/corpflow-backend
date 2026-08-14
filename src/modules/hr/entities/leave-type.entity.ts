import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('leave_types')
export class LeaveType { @PrimaryGeneratedColumn('uuid') id: string; @Column() name: string; }
