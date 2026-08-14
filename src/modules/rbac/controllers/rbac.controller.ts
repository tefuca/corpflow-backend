import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class RbacController {
  constructor(private rbacService: RbacService) {}

  // ROLES
  @Get('roles')
  @RequirePermissions(['ROLE_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all roles' })
  async getAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @RequirePermissions(['ROLE_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get role by ID' })
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findRoleById(id);
  }

  @Post('roles')
  @RequirePermissions(['ROLE_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create new role' })
  async createRole(@Body() createRoleDto: CreateRoleDto, @CurrentUser('sub') userId: number) {
    return this.rbacService.createRole(createRoleDto, userId);
  }

  @Put('roles/:id')
  @RequirePermissions(['ROLE_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update role' })
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @RequirePermissions(['ROLE_MANAGEMENT', 'delete'])
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.rbacService.deleteRole(id);
    return { message: 'Role deleted successfully' };
  }

  // PERMISSIONS
  @Get('roles/:id/permissions')
  @RequirePermissions(['ROLE_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get role permissions' })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.getRolePermissions(id);
  }

  @Put('roles/:id/permissions')
  @RequirePermissions(['ROLE_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update role permissions' })
  async updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
  ) {
    await this.rbacService.updateRolePermissions(id, updatePermissionsDto);
    return { message: 'Permissions updated successfully' };
  }

  // USERS
  @Get('users')
  @RequirePermissions(['USER_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return this.rbacService.findAllUsers();
  }

  @Get('users/:id')
  @RequirePermissions(['USER_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findUserById(id);
  }

  @Post('users')
  @RequirePermissions(['USER_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() createUserDto: CreateUserDto, @CurrentUser('sub') userId: number) {
    return this.rbacService.createUser(createUserDto, userId);
  }

  @Put('users/:id')
  @RequirePermissions(['USER_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.rbacService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @RequirePermissions(['USER_MANAGEMENT', 'delete'])
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.rbacService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  // USER-ROLE ASSIGNMENT
  @Post('users/assign-role')
  @RequirePermissions(['USER_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
      assignRoleDto.isPrimary,
    );
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermissions(['USER_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Remove role from user' })
  async removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    await this.rbacService.removeRoleFromUser(userId, roleId);
    return { message: 'Role removed from user' };
  }

  @Get('users/:id/roles')
  @RequirePermissions(['USER_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get user roles' })
  async getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.getUserRoles(id);
  }

  @Get('users/:id/permissions')
  @RequirePermissions(['USER_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get user permissions' })
  async getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.getUserPermissions(id);
  }

  @Get('users/:id/menu')
  @ApiOperation({ summary: 'Get visible menu items for user' })
  async getUserMenu(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.getVisibleMenuItems(id);
  }

  // SYSTEM FUNCTIONS
  @Get('functions')
  @RequirePermissions(['ROLE_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all system functions' })
  async getAllFunctions() {
    return this.rbacService.findAllFunctions();
  }
    @Post('seed-functions')
  @RequirePermissions(['ROLE_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Seed system functions (one-time)' })
  async seedSystemFunctions() {
    return this.rbacService.seedSystemFunctions();
  }
}