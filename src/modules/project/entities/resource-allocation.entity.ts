import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('resource_allocations')
export class ResourceAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.resourceAllocations)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  resourceId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedHours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cost: number;
}
