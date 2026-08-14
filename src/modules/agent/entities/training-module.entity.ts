import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CreateDateColumn } from 'typeorm';
@Entity('training_modules')
export class TrainingModule {
  @CreateDateColumn()
  createdAt: Date;
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) description?: string;
}
