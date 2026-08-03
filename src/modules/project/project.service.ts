import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectService {
  async findAll() {
    return { message: 'Project findAll - implement me' };
  }

  async findOne(id: number) {
    return { message: 'Project findOne', id };
  }

  async create(dto: any, userId: number) {
    return { message: 'Project create', dto, userId };
  }

  async update(id: number, dto: any) {
    return { message: 'Project update', id, dto };
  }

  async remove(id: number) {
    return { message: 'Project remove', id };
  }
}