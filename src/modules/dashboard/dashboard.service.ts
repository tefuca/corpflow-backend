import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getSummary(userId: number) {
    return { message: 'Dashboard summary - implement me', userId };
  }

  async getMetrics() {
    return { message: 'Dashboard metrics - implement me' };
  }
}