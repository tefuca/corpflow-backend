import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/rbac/entities/user.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { UserRole } from '../../modules/rbac/entities/user-role.entity';
import { RoleStatus } from '../../modules/rbac/entities/role.entity'; // ✅ Add this import

export default async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const userRoleRepo = dataSource.getRepository(UserRole);

  // Create System Admin role if missing
  let adminRole = await roleRepo.findOne({ where: { roleName: 'System Admin' } });
  if (!adminRole) {
    adminRole = roleRepo.create({
      roleName: 'System Admin',
      roleDescription: 'Full system access',
      isSystemRole: true,
      status: RoleStatus.ACTIVE, // ✅ Fixed: was 'active'
    });
	adminRole = await roleRepo.save(adminRole);
    console.log('✅ System Admin role created');
  }

  // Create admin user if missing
  const existing = await userRepo.findOne({ where: { username: 'admin' } });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@123', 10);
    const user = await userRepo.save({
      username: 'admin',
      email: 'admin@corpflow.local',
      passwordHash: hash,
      fullName: 'System Administrator',
      status: 'Active',
    } as any);

    // Link user to role via UserRole junction table
    await userRoleRepo.save({
      userId: user.id,
      roleId: adminRole.id,
      isPrimary: true,
    });
	await userRoleRepo.save(userRole);
	
    console.log('✅ Admin user seeded: admin / Admin@123');
  } else {
    console.log('ℹ️ Admin user already exists, 
skipping seed');
  }
}
