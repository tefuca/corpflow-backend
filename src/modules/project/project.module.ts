// src/modules/project/project.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { Milestone } from './entities/milestone.entity';
import { Task } from './entities/task.entity';
import { ResourceAllocation } from './entities/resource-allocation.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { ProjectExpense } from './entities/project-expense.entity';
import { ProjectBudget } from './entities/project-budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Milestone,
      Task,
      ResourceAllocation,
      TimeEntry,
      ProjectExpense,
      ProjectBudget,
    ]),
    RbacModule, // ← Keep this from your GitHub version
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
