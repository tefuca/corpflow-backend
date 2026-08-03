import { Module } from '@nestjs/common';
import { RbacModule } from '../rbac/rbac.module';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [RbacModule],
  controllers: [HrController],
  providers: [HrService],
})
export class HrModule {}