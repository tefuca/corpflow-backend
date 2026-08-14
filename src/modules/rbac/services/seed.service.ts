import { Injectable } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Injectable()
export class SeedService {
  constructor(private readonly rbacService: RbacService) {}

  async seedSystemFunctions() {
    return this.rbacService.seedSystemFunctions();
  }
}
