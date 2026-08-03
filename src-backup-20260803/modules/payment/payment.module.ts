import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { PaymentRequest } from './entities/payment-request.entity';
import { ScheduleItem } from './entities/schedule-item.entity';
import { PaymentConfirmation } from './entities/payment-confirmation.entity';
import { PaymentApproval } from './entities/payment-approval.entity';
import { Dap } from './entities/dap.entity';
import { Agent } from './entities/agent.entity';
import { ActivityType } from './entities/activity-type.entity';
import { BulkUpload } from './entities/bulk-upload.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BulkUpload,
      PaymentSchedule,
      PaymentRequest,
      ScheduleItem,
      PaymentConfirmation,
      PaymentApproval,
      Dap,
      Agent,
      ActivityType,
    ]),
    RbacModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}