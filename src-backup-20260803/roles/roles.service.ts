import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/rbac/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['rolePermissions'] });
  }

  async findOne(id: number): Promise<Role> {
    return this.roleRepository.findOne({ where: { id }, relations: ['rolePermissions'] });
  }

  async findByName(roleName: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { roleName }, relations: ['rolePermissions'] });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    const saved = await this.roleRepository.save(role);
    return Array.isArray(saved) ? saved[0] : saved;
  }
}