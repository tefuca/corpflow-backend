import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectCostingService } from './services/project-costing.service';

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
      Project, Milestone, Task, ResourceAllocation,
      TimeEntry, ProjectExpense, ProjectBudget,
    ]),
    RbacModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectCostingService],
  exports: [ProjectService, ProjectCostingService],
})
export class ProjectModule {}
