import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('project_budgets')
export class ProjectBudget { @PrimaryGeneratedColumn('uuid') id: string; @Column() projectId: string; @Column('decimal') amount: number; }
