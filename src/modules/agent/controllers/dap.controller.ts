import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DapService } from '../services/dap.service';
import { CreateDapDto, UpdateDapDto } from '../dto/dap.dto';

@Controller('daps')
@UseGuards(AuthGuard('jwt'))
export class DapController {
  constructor(private dapService: DapService) {}

  @Post()
  create(@Body() dto: CreateDapDto) {
    return this.dapService.create(dto);
  }

  @Get()
  findAll() {
    return this.dapService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dapService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDapDto) {
    return this.dapService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dapService.remove(id);
  }
}

