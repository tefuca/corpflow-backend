import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('leave_requests')
export class LeaveRequest { @PrimaryGeneratedColumn('uuid') id: string; @Column() employeeId: string; }
