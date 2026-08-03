import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

export enum UploadType {
  AGENT = 'Agent',
  DAP = 'DAP',
  PAYMENT = 'Payment',
  EMPLOYEE = 'Employee',
  STOCK = 'Stock',
  ASSET = 'Asset',
}

export enum UploadStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

@Entity('bulk_uploads')
export class BulkUpload extends BaseEntity {
  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'upload_type', type: 'enum', enum: UploadType })
  uploadType: UploadType;

  @Column({ name: 'total_records', type: 'int', default: 0 })
  totalRecords: number;

  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'error_count', type: 'int', default: 0 })
  errorCount: number;

  @Column({ name: 'error_details', type: 'jsonb', nullable: true })
  errorDetails: any | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UploadStatus,
    default: UploadStatus.PENDING,
  })
  status: UploadStatus;

  @Column({ name: 'processed_by', type: 'int', nullable: true })
  processedBy: number | null;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;
}
