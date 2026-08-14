import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.milestones)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  targetDate: Date | null;

  @Column({ type: 'date', nullable: true })
  completedDate: Date | null;

  @Column({ default: false })
  isCompleted: boolean;
}
