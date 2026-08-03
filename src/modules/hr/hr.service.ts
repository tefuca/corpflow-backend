import { Injectable } from '@nestjs/common';

@Injectable()
export class HrService {
  async findAll() {
    return { message: 'HR findAll - implement me' };
  }

  async findOne(id: number) {
    return { message: 'HR findOne', id };
  }

  async create(dto: any, userId: number) {
    return { message: 'HR create', dto, userId };
  }

  async update(id: number, dto: any) {
    return { message: 'HR update', id, dto };
  }

  async remove(id: number) {
    return { message: 'HR remove', id };
  }
}