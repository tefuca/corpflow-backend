import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { AuditLogModule } from '../audit-logs/audit-logs.module';
import { ProjectController } from './project.controller';
import { ProjectsService } from './project.service';
import { ProjectCostingService } from './services/project-costing.service';

import { Project } from './entities/project.entity';
// Project entity imported via TypeOrmModule.forFeature
import { Milestone } from './entities/milestone.entity';
import { Task } from './entities/task.entity';
import { ResourceAllocation } from './entities/resource-allocation.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { ProjectExpense } from './entities/project-expense.entity';
import { ProjectBudget } from './entities/project-budget.entity';
import { Timesheet } from '../timesheet/entities/timesheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, Milestone, Task, ResourceAllocation,
      TimeEntry, ProjectExpense, ProjectBudget,
	  Timesheet,
    ]),
    RbacModule,
	AuditLogModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectsService, ProjectCostingService],
  exports: [ProjectsService, ProjectCostingService],
})
export class ProjectModule {}
