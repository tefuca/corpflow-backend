import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Execution } from './entities/execution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Execution])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ExecutionsModule {}
