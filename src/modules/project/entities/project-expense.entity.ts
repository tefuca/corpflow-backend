import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('project_expenses')
export class ProjectExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column('decimal')
  amount: number;

  @Column({ default: false })
  approved: boolean;
}