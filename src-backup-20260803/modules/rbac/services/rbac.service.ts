import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleStatus } from '../entities/role.entity';
import { User, UserStatus } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { SystemFunction, FunctionStatus } from '../entities/system-function.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @InjectRepository(SystemFunction)
    private functionRepo: Repository<SystemFunction>,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
  ) {}

  // ==================== ROLE MANAGEMENT ====================
  async findAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.systemFunction'],
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async createRole(createRoleDto: CreateRoleDto, createdBy?: number): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: { roleName: createRoleDto.roleName },
    });
    if (existing) throw new BadRequestException('Role name already exists');

    const role = this.roleRepo.create({ ...createRoleDto, createdBy });
    const savedRole = await this.roleRepo.save(role);

    const allFunctions = await this.functionRepo.find({ where: { status: FunctionStatus.ACTIVE } });
    const permissions = allFunctions.map((func) =>
      this.rolePermissionRepo.create({
        role: savedRole,
        roleId: savedRole.id,
        systemFunction: func,
        functionId: func.id,
        noAccess: true,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
      }),
    );
    await this.rolePermissionRepo.save(permissions);
    return savedRole;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);
    if (role.isSystemRole) throw new BadRequestException('Cannot modify system roles');
    Object.assign(role, updateRoleDto);
    return this.roleRepo.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.findRoleById(id);
    if (role.isSystemRole) throw new BadRequestException('Cannot delete system roles');
    const userCount = await this.userRoleRepo.count({ where: { roleId: id } });
    if (userCount > 0) throw new BadRequestException('Users still assigned to this role');
    await this.roleRepo.remove(role);
  }

  // ==================== PERMISSION MANAGEMENT ====================
  async getRolePermissions(roleId: number): Promise<any[]> {
    const permissions = await this.rolePermissionRepo.find({
      where: { roleId },
      relations: ['systemFunction'],
      order: { systemFunction: { displayOrder: 'ASC' } },
    });
    return permissions.map((p) => ({
      id: p.id,
      functionId: p.functionId,
      functionCode: p.systemFunction.functionCode,
      functionName: p.systemFunction.functionName,
      parentFunction: p.systemFunction.parentFunction,
      iconClass: p.systemFunction.iconClass,
      displayOrder: p.systemFunction.displayOrder,
      isMenuItem: p.systemFunction.isMenuItem,
      noAccess: p.noAccess,
      canView: p.canView,
      canAdd: p.canAdd,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
    }));
  }

  async updateRolePermissions(roleId: number, dto: UpdatePermissionsDto): Promise<void> {
    const role = await this.findRoleById(roleId);
    if (role.isSystemRole) throw new BadRequestException('Cannot modify system role permissions');
    for (const perm of dto.permissions) {
      await this.rolePermissionRepo.update(
        { roleId, functionId: perm.functionId },
        {
          noAccess: perm.noAccess,
          canView: perm.canView,
          canAdd: perm.canAdd,
          canEdit: perm.canEdit,
          canDelete: perm.canDelete,
        },
      );
    }
  }

  // ==================== USER MANAGEMENT ====================
  async findAllUsers(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async createUser(createUserDto: CreateUserDto, createdBy?: number): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });
    if (existing) throw new BadRequestException('Username or email already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepo.create({
      username: createUserDto.username,
      passwordHash: hashedPassword,
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      phone: createUserDto.phone || null,
      gender: createUserDto.gender || null,
      region: createUserDto.region || null,
      status: createUserDto.status || UserStatus.ACTIVE,
      createdBy,
    });
    return this.userRepo.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepo.remove(user);
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.findUserById(userId);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);
  }

  // ==================== USER-ROLE ASSIGNMENT ====================
  async assignRoleToUser(userId: number, roleId: number, isPrimary: boolean = false): Promise<UserRole> {
    const user = await this.findUserById(userId);
    const role = await this.findRoleById(roleId);

    const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
    if (existing) {
      existing.isPrimary = isPrimary;
      return this.userRoleRepo.save(existing);
    }

    if (isPrimary) {
      await this.userRoleRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    }

    const userRole = this.userRoleRepo.create({ user, userId, role, roleId, isPrimary });
    return this.userRoleRepo.save(userRole);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepo.findOne({ where: { userId, roleId } });
    if (!userRole) throw new NotFoundException('Role assignment not found');
    await this.userRoleRepo.remove(userRole);
  }

  async getUserRoles(userId: number): Promise<any[]> {
    const userRoles = await this.userRoleRepo.find({ where: { userId }, relations: ['role'] });
    return userRoles.map((ur) => ({
      id: ur.role.id,
      roleName: ur.role.roleName,
      roleDescription: ur.role.roleDescription,
      isPrimary: ur.isPrimary,
    }));
  }

  // ==================== PERMISSION CHECKING ====================
  async getUserPermissions(userId: number): Promise<Record<string, any>> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.systemFunction'],
    });

    const permissions: Record<string, any> = {};
    for (const userRole of userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        const code = rp.systemFunction.functionCode;
        if (!permissions[code]) {
          permissions[code] = { noAccess: true, canView: false, canAdd: false, canEdit: false, canDelete: false };
        }
        if (!rp.noAccess) permissions[code].noAccess = false;
        if (rp.canView) permissions[code].canView = true;
        if (rp.canAdd) permissions[code].canAdd = true;
        if (rp.canEdit) permissions[code].canEdit = true;
        if (rp.canDelete) permissions[code].canDelete = true;
      }
    }
    return permissions;
  }

  async checkUserPermission(
    userId: number,
    functionCode: string,
    action: 'view' | 'add' | 'edit' | 'delete' = 'view',
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const perm = permissions[functionCode];
    if (!perm || perm.noAccess) return false;
    const actionMap = { view: 'canView', add: 'canAdd', edit: 'canEdit', delete: 'canDelete' };
    return perm[actionMap[action]] === true;
  }

  async getVisibleMenuItems(userId: number): Promise<any[]> {
    const permissions = await this.getUserPermissions(userId);
    const allFunctions = await this.functionRepo.find({
      where: { status: FunctionStatus.ACTIVE, isMenuItem: true },
      order: { displayOrder: 'ASC' },
    });
    return allFunctions
      .filter((func) => {
        const perm = permissions[func.functionCode];
        return perm && !perm.noAccess && perm.canView;
      })
      .map((func) => ({
        functionCode: func.functionCode,
        functionName: func.functionName,
        parentFunction: func.parentFunction,
        menuPath: func.menuPath,
        iconClass: func.iconClass,
        displayOrder: func.displayOrder,
      }));
  }

  // ==================== SYSTEM FUNCTIONS ====================
  async findAllFunctions(): Promise<SystemFunction[]> {
    return this.functionRepo.find({
      where: { status: FunctionStatus.ACTIVE },
      order: { displayOrder: 'ASC' },
    });
  }

  async createFunction(data: Partial<SystemFunction>): Promise<SystemFunction> {
    const func = this.functionRepo.create(data);
    return this.functionRepo.save(func);
  }

  // ==================== SEED SYSTEM FUNCTIONS ====================
  async seedSystemFunctions(): Promise<{ inserted: string[]; skipped: string[] }> {
    const functions = [
      { functionCode: 'HR_MANAGEMENT', functionName: 'HR Management', menuPath: '/hr', iconClass: 'bi bi-people', displayOrder: 10 },
      { functionCode: 'FIXED_ASSET_MANAGEMENT', functionName: 'Fixed Asset Management', menuPath: '/fixed-assets', iconClass: 'bi bi-building', displayOrder: 20 },
      { functionCode: 'PROJECT_MANAGEMENT', functionName: 'Project Management', menuPath: '/projects', iconClass: 'bi bi-kanban', displayOrder: 30 },
      { functionCode: 'DASHBOARD', functionName: 'Dashboard', menuPath: '/dashboard', iconClass: 'bi bi-speedometer', displayOrder: 1 },
      { functionCode: 'REPORT_MANAGEMENT', functionName: 'Report Management', menuPath: '/reports', iconClass: 'bi bi-file-earmark-bar-graph', displayOrder: 40 },
    ];

    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const f of functions) {
      const existing = await this.functionRepo.findOne({ where: { functionCode: f.functionCode } });
      if (existing) {
        skipped.push(f.functionCode);
        continue;
      }

      const newFunc = this.functionRepo.create({
        ...f,
        status: FunctionStatus.ACTIVE,
        isMenuItem: true,
        parentFunction: null,
      });
      await this.functionRepo.save(newFunc);
      inserted.push(f.functionCode);

      const roles = await this.roleRepo.find();
      for (const role of roles) {
        const perm = this.rolePermissionRepo.create({
          role,
          roleId: role.id,
          systemFunction: newFunc,
          functionId: newFunc.id,
          noAccess: true,
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
        });
        await this.rolePermissionRepo.save(perm);
      }
    }

    return { inserted, skipped };
  }
}