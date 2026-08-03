import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus, PaymentCategory, PaymentMethod } from './entities/payment.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('System Admin', 'Finance Officer', 'Finance Manager')
  @ApiOperation({ summary: 'Create a new payment request' })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.create(createPaymentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'category', required: false, enum: PaymentCategory })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'payeeId', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: PaymentStatus,
    @Query('category') category?: PaymentCategory,
    @Query('projectId') projectId?: string,
    @Query('payeeId') payeeId?: string,
  ) {
    return this.paymentsService.findAll(page, limit, search, status, category, projectId, payeeId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get payment summary statistics' })
  getSummary() {
    return this.paymentsService.getPaymentSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('code/:paymentCode')
  @ApiOperation({ summary: 'Get payment by payment code' })
  findByCode(@Param('paymentCode') paymentCode: string) {
    return this.paymentsService.findByCode(paymentCode);
  }

  @Patch(':id')
  @Roles('System Admin', 'Finance Officer', 'Finance Manager')
  @ApiOperation({ summary: 'Update a payment' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, userId);
  }

  @Delete(':id')
  @Roles('System Admin', 'Finance Manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a payment' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles('System Admin')
  @ApiOperation({ summary: 'Restore a soft-deleted payment' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.restore(id, userId);
  }

  @Post(':id/submit')
  @Roles('System Admin', 'Finance Officer', 'Finance Manager')
  @ApiOperation({ summary: 'Submit payment for approval' })
  submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.submitForApproval(id, userId);
  }

  @Post(':id/approve')
  @Roles('System Admin', 'Finance Manager', 'Management')
  @ApiOperation({ summary: 'Approve a pending payment' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvalNotes') approvalNotes: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.approve(id, approvalNotes, userId);
  }

  @Post(':id/reject')
  @Roles('System Admin', 'Finance Manager', 'Management')
  @ApiOperation({ summary: 'Reject a pending payment' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.reject(id, rejectionReason, userId);
  }
}