import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/rbac/entities/user.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { Role } from '../modules/rbac/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) return null;

    // Fetch primary role from junction table
    const userRole = await this.userRoleRepository.findOne({
      where: { userId: user.id, isPrimary: true },
    });

    let roleName = 'System Admin';
    if (userRole) {
      const role = await this.roleRepository.findOne({
        where: { id: userRole.roleId },
      });
      if (role) roleName = role.roleName;
    }

    // Remove passwordHash from returned object
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      role: roleName,
    };
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
