import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('payroll_details')
export class PayrollDetail { @PrimaryGeneratedColumn('uuid') id: string; @Column() payrollRunId: string; }
