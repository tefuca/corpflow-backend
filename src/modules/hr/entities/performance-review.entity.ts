import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('performance_reviews')
export class PerformanceReview { @PrimaryGeneratedColumn('uuid') id: string; @Column() employeeId: string; }
