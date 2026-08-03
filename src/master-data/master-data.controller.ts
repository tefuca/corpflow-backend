import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Master Data')
@Controller('master-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  @Get()
  getAll() {
    return this.masterDataService.getAll();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.masterDataService.get(key);
  }
}