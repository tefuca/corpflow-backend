import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export default async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository('User');
  const roleRepo = dataSource.getRepository('Role');
  
  // Create System Admin role if missing
  let adminRole = await roleRepo.findOne({ where: { role_name: 'System Admin' } });
  if (!adminRole) {
    adminRole = await roleRepo.save({
      role_name: 'System Admin',
      role_description: 'Full system access',
      is_system_role: true,
      status: 'active',
    });
  }
  
  // Create admin user if missing
  const existing = await userRepo.findOne({ where: { username: 'admin' } });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await userRepo.save({
      username: 'admin',
      email: 'admin@corpflow.local',
      password_hash: hash,
      full_name: 'System Administrator',
      status: 'active',
      userRoles: [{ role_id: adminRole.id, is_primary: true }],
    });
    console.log('Admin user seeded: admin / Admin@123');
  }
}