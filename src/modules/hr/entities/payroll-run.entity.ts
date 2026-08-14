import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('payroll_runs')
export class PayrollRun { @PrimaryGeneratedColumn('uuid') id: string; @Column() periodStart: Date; @Column() periodEnd: Date; }
