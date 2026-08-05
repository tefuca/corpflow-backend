import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

import { Department } from './entities/department.entity';
import { JobPosition } from './entities/job-position.entity';
import { Employee } from './entities/employee.entity';
import { Timesheet } from './entities/timesheet.entity';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PayrollRun } from './entities/payroll-run.entity';
import { PayrollDetail } from './entities/payroll-detail.entity';
import { PerformanceReview } from './entities/performance-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department, JobPosition, Employee, Timesheet,
      LeaveType, LeaveRequest, PayrollRun, PayrollDetail, PerformanceReview,
    ]),
    RbacModule,
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
