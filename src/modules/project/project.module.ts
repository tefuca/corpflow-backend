import { Module } from '@nestjs/common';
import { RbacModule } from '../rbac/rbac.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [RbacModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}