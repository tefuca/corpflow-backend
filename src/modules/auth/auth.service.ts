import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../rbac/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RbacService } from '../rbac/services/rbac.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private jwtService: JwtService,
    private rbacService: RbacService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { username: loginDto.username },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive or locked');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.roleName),
    };

    user.lastLogin = new Date();
    await this.userRepo.save(user);

    const permissions = await this.rbacService.getUserPermissions(user.id);
    const menuItems = await this.rbacService.getVisibleMenuItems(user.id);

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        roles: payload.roles,
        permissions,
        menuItems,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });

    if (existing) {
      throw new BadRequestException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepo.create({
      username: registerDto.username,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone || null,
      gender: registerDto.gender || null,
      region: registerDto.region || null,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepo.save(user);

    const defaultRole = await this.roleRepo.findOne({
      where: { roleName: 'Agent' },
    });

    if (defaultRole) {
      await this.rbacService.assignRoleToUser(savedUser.id, defaultRole.id, true);
    }

    return {
      id: savedUser.id,
      username: savedUser.username,
      fullName: savedUser.fullName,
      email: savedUser.email,
      message: 'User registered successfully',
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = await this.rbacService.getUserPermissions(userId);
    const menuItems = await this.rbacService.getVisibleMenuItems(userId);

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      region: user.region,
      status: user.status,
      lastLogin: user.lastLogin,
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.roleName,
        isPrimary: ur.isPrimary,
      })),
      permissions,
      menuItems,
    };
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }
}
