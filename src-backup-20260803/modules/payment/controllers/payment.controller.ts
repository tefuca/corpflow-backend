import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../auth/guards/permission.guard';
import { RequirePermissions } from '../../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { CreateDapPaymentDto } from '../dto/create-dap-payment.dto';
import { CreateNonDapPaymentDto } from '../dto/create-non-dap-payment.dto';
import { PaymentExecutionDto } from '../dto/payment-execution.dto';
import { BulkUploadDto } from '../dto/bulk-upload.dto';
import { UploadStatus } from '../entities/bulk-upload.entity';

@ApiTags('Payment')
@Controller('payment')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('dap')
  @RequirePermissions('DAP_PAYMENT_REQ', 'add')
  @ApiOperation({ summary: 'Create DAP payment request' })
  async createDapPayment(@Body() dto: CreateDapPaymentDto, @CurrentUser('sub') userId: number) {
    return this.paymentService.createDapPayment(dto, userId);
  }

  @Post('non-dap')
  @RequirePermissions('NON_DAP_PAYMENT_REQ', 'add')
  @ApiOperation({ summary: 'Create Non-DAP payment request' })
  async createNonDapPayment(@Body() dto: CreateNonDapPaymentDto, @CurrentUser('sub') userId: number) {
    return this.paymentService.createNonDapPayment(dto, userId);
  }

  @Get('daps')
  @RequirePermissions('DAP_MASTER', 'view')
  @ApiOperation({ summary: 'Get all DAPs' })
  async getAllDaps() {
    return this.paymentService.getAllDaps();
  }

  @Get('agents')
  @RequirePermissions('AGENT_MASTER', 'view')
  @ApiOperation({ summary: 'Get all agents' })
  async getAllAgents() {
    return this.paymentService.getAllAgents();
  }

  @Get('agents/dap/:dapId')
  @RequirePermissions('AGENT_MASTER', 'view')
  @ApiOperation({ summary: 'Get agents by DAP' })
  async getAgentsByDap(@Param('dapId', ParseIntPipe) dapId: number) {
    return this.paymentService.getAgentsByDap(dapId);
  }

  @Get('activity-types')
  @RequirePermissions('DAP_PAYMENT_REQ', 'view')
  @ApiOperation({ summary: 'Get activity types' })
  async getActivityTypes() {
    return this.paymentService.getActivityTypes();
  }

  @Get('schedules')
  @RequirePermissions('DAP_PAYMENT_SCH', 'view')
  @ApiOperation({ summary: 'Get all payment schedules' })
  async getSchedules(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentService.getSchedules({ status, page, limit });
  }

  @Get('schedules/:id')
  @RequirePermissions('DAP_PAYMENT_SCH', 'view')
  @ApiOperation({ summary: 'Get schedule details' })
  async getScheduleDetails(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getScheduleDetails(id);
  }

  @Get('pending-approvals')
  @RequirePermissions('DAP_PAYMENT_APP', 'view')
  @ApiOperation({ summary: 'Get pending approvals' })
  async getPendingApprovals() {
    return this.paymentService.getPendingApprovals();
  }

  @Put('schedules/:id/submit')
  @RequirePermissions('DAP_PAYMENT_SCH', 'edit')
  @ApiOperation({ summary: 'Submit schedule for approval' })
  async submitForApproval(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.submitForApproval(id);
  }

  @Put('schedules/:id/approve')
  @RequirePermissions('DAP_PAYMENT_APP', 'edit')
  @ApiOperation({ summary: 'Approve payment schedule' })
  async approveSchedule(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
    @Body('comments') comments?: string,
  ) {
    return this.paymentService.approveSchedule(id, userId, comments);
  }

  @Put('schedules/:id/reject')
  @RequirePermissions('DAP_PAYMENT_APP', 'edit')
  @ApiOperation({ summary: 'Reject payment schedule' })
  async rejectSchedule(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
    @Body('reason') reason: string,
  ) {
    return this.paymentService.rejectSchedule(id, userId, reason);
  }

  @Post('execute')
  @RequirePermissions('PAYMENT_EXECUTION', 'add')
  @UseInterceptors(FileInterceptor('bankAdvice'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Execute payment with bank confirmation' })
  async executePayment(
    @Body() dto: PaymentExecutionDto,
    @CurrentUser('sub') userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|xlsx|xls|csv)$/ }),
        ],
        fileIsRequired: false,
      }),
    ) file?: Express.Multer.File,
  ) {
    return this.paymentService.executePayment(dto, userId, file);
  }

  @Post('bulk-upload')
  @RequirePermissions('BULK_UPLOAD', 'add')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload bulk data file' })
  async bulkUpload(
    @Body() dto: BulkUploadDto,
    @CurrentUser('sub') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentService.createBulkUpload({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      uploadType: dto.uploadType,
	status: UploadStatus.PENDING,
      createdBy: userId,
    });
  }

  @Get('bulk-uploads')
  @RequirePermissions('BULK_UPLOAD', 'view')
  @ApiOperation({ summary: 'Get bulk upload history' })
  async getBulkUploads() {
    return this.paymentService.getBulkUploads();
  }

  @Get('dashboard/stats')
  @RequirePermissions('DESKTOP', 'view')
  @ApiOperation({ summary: 'Get payment dashboard statistics' })
  async getDashboardStats() {
    return this.paymentService.getDashboardStats();
  }
}
