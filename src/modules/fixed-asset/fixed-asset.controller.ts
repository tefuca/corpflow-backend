import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { FixedAssetService } from './services/fixed-asset.service';
import { CreateFixedAssetDto } from './dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from './dto/update-fixed-asset.dto';

@Controller('fixed-assets')
export class FixedAssetController {
  constructor(private readonly fixedAssetService: FixedAssetService) {}

  @Post()
  create(@Body() dto: CreateFixedAssetDto, @Req() req: any) {
    return this.fixedAssetService.create(dto, req.user?.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.fixedAssetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixedAssetService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFixedAssetDto,
    @Req() req: any,
  ) {
    return this.fixedAssetService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.fixedAssetService.remove(id, req.user?.id);
  }
}