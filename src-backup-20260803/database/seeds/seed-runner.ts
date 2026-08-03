import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// ✅ Load .env BEFORE anything else
const envPath = path.resolve(process.cwd(), '.env');
const result = config({ path: envPath });

if (result.error) {
  console.warn('⚠️  No .env file found at:', envPath);
  console.warn('   Falling back to environment variables...');
}

// ✅ Validate required DB config
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD || DB_PASSWORD === 'your_password' || DB_PASSWORD.trim() === '') {
  console.error('❌ ERROR: DB_PASSWORD is not set or is still the placeholder value.');
  console.error('   Current value:', DB_PASSWORD);
  console.error('   Please copy .env.example to .env and set a real password:');
  console.error('   cp .env.example .env');
  console.error('   # Then edit .env and set DB_PASSWORD=your_actual_password');
  process.exit(1);
}

const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
if (isNaN(DB_PORT)) {
  console.error('❌ ERROR: DB_PORT is not a valid number:', process.env.DB_PORT);
  process.exit(1);
}

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: DB_PORT,
  username: process.env.DB_USERNAME || 'postgres',
  password: DB_PASSWORD, // ✅ guaranteed non-empty string
  database: process.env.DB_NAME || 'crms_db',
  synchronize: true,
  logging: process.env.APP_ENV === 'development', // optional: log queries in dev
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected. Starting seed...');

    // ── Create tables using raw SQL ──
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(100) UNIQUE NOT NULL,
        role_description VARCHAR(255),
        is_system_role BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      );
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS system_functions (
        id SERIAL PRIMARY KEY,
        function_code VARCHAR(100) UNIQUE NOT NULL,
        function_name VARCHAR(150) NOT NULL,
        parent_function VARCHAR(100),
        menu_path VARCHAR(255),
        icon_class VARCHAR(50) DEFAULT 'bi bi-file',
        display_order INTEGER DEFAULT 0,
        is_menu_item BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        gender VARCHAR(20),
        region VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      );
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT false,
        UNIQUE(user_id, role_id)
      );
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        function_id INTEGER REFERENCES system_functions(id) ON DELETE CASCADE,
        no_access BOOLEAN DEFAULT true,
        can_view BOOLEAN DEFAULT false,
        can_add BOOLEAN DEFAULT false,
        can_edit BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        UNIQUE(role_id, function_id)
      );
    `);

    // ── Insert roles ──
    const roles = [
      { role_name: 'Administrator', role_description: 'Full system access', is_system_role: true },
      { role_name: 'Management', role_description: 'View-only oversight', is_system_role: false },
      { role_name: 'Accountant', role_description: 'Payment schedules and requests', is_system_role: false },
      { role_name: 'Finance Head', role_description: 'Payment approval', is_system_role: false },
      { role_name: 'Agent', role_description: 'Creates requests, views own history', is_system_role: false },
      { role_name: 'Cluster Contact', role_description: 'Manages agents/DAPs, NO payments', is_system_role: false },
    ];

    for (const role of roles) {
      await dataSource.query(`
        INSERT INTO roles (role_name, role_description, is_system_role, status)
        VALUES ($1, $2, $3, 'Active')
        ON CONFLICT (role_name) DO NOTHING;
      `, [role.role_name, role.role_description, role.is_system_role]);
      console.log(`  ✅ Role: ${role.role_name}`);
    }

    // ── Insert system functions ──
    const functions = [
      { code: 'DESKTOP', name: 'Desktop', parent: null, path: 'dashboard', icon: 'bi bi-speedometer2', order: 1 },
      { code: 'AGENT_MASTER', name: 'Agent', parent: 'MASTER_DATA', path: 'agents', icon: 'bi bi-people', order: 11 },
      { code: 'DAP_MASTER', name: 'DAP', parent: 'MASTER_DATA', path: 'daps', icon: 'bi bi-building', order: 12 },
      { code: 'DAP_PAYMENT_REQ', name: 'DAP Payment Request', parent: 'PAYMENT_REQUEST', path: 'payment-dap-request', icon: 'bi bi-file-earmark-plus', order: 21 },
      { code: 'NON_DAP_PAYMENT_REQ', name: 'Non DAP Payment Request', parent: 'PAYMENT_REQUEST', path: 'payment-non-dap-request', icon: 'bi bi-file-earmark-plus', order: 22 },
      { code: 'DAP_PAYMENT_SCH', name: 'DAP Payment Schedule', parent: 'PAYMENT_SCHEDULE', path: 'payment-dap-schedules', icon: 'bi bi-calendar-week', order: 31 },
      { code: 'NON_DAP_PAYMENT_SCH', name: 'Non DAP Payment Schedule', parent: 'PAYMENT_SCHEDULE', path: 'payment-non-dap-schedules', icon: 'bi bi-calendar-week', order: 32 },
      { code: 'DAP_PAYMENT_APP', name: 'DAP Payment Approval', parent: 'PAYMENT_APPROVAL', path: 'payment-dap-approvals', icon: 'bi bi-check-circle', order: 41 },
      { code: 'NON_DAP_PAYMENT_APP', name: 'Non DAP Payment Approval', parent: 'PAYMENT_APPROVAL', path: 'payment-non-dap-approvals', icon: 'bi bi-check-circle', order: 42 },
      { code: 'PAYMENT_EXECUTION', name: 'Payment Execution', parent: null, path: 'payment-execution', icon: 'bi bi-credit-card', order: 50 },
      { code: 'BULK_UPLOAD', name: 'Bulk Upload', parent: null, path: 'bulk-upload', icon: 'bi bi-upload', order: 60 },
      { code: 'REPORTS', name: 'Reports', parent: null, path: 'reports', icon: 'bi bi-graph-up', order: 70 },
      { code: 'USER_MANAGEMENT', name: 'User Management', parent: 'ADMIN', path: 'users', icon: 'bi bi-person-gear', order: 100 },
      { code: 'ROLE_MANAGEMENT', name: 'Role Management', parent: 'ADMIN', path: 'role-management', icon: 'bi bi-shield-check', order: 101 },
    ];

    for (const func of functions) {
      await dataSource.query(`
        INSERT INTO system_functions (function_code, function_name, parent_function, menu_path, icon_class, display_order, is_menu_item, status)
        VALUES ($1, $2, $3, $4, $5, $6, true, 'Active')
        ON CONFLICT (function_code) DO NOTHING;
      `, [func.code, func.name, func.parent, func.path, func.icon, func.order]);
      console.log(`  ✅ Function: ${func.code}`);
    }

    // ── Insert admin user ──
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dataSource.query(`
      INSERT INTO users (username, password_hash, full_name, email, status)
      VALUES ('admin', $1, 'System Administrator', 'admin@crms.local', 'Active')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
    console.log('  ✅ Admin user created: admin / admin123');

    // ── Get IDs and assign role ──
    const adminUserResult = await dataSource.query(`SELECT id FROM users WHERE username = 'admin'`);
    const adminRoleResult = await dataSource.query(`SELECT id FROM roles WHERE role_name = 'Administrator'`);

    if (adminUserResult.length > 0 && adminRoleResult.length > 0) {
      const userId = adminUserResult[0].id;
      const roleId = adminRoleResult[0].id;

      await dataSource.query(`
        INSERT INTO user_roles (user_id, role_id, is_primary)
        VALUES ($1, $2, true)
        ON CONFLICT DO NOTHING;
      `, [userId, roleId]);
      console.log('  ✅ Admin role assigned');

      // Set admin permissions for all functions
      const allFunctions = await dataSource.query(`SELECT id FROM system_functions`);
      for (const func of allFunctions) {
        await dataSource.query(`
          INSERT INTO role_permissions (role_id, function_id, no_access, can_view, can_add, can_edit, can_delete)
          VALUES ($1, $2, false, true, true, true, true)
          ON CONFLICT (role_id, function_id) DO NOTHING;
        `, [roleId, func.id]);
      }
      console.log(`  ✅ Admin permissions set for ${allFunctions.length} functions`);
    }

    console.log('\n🎉 Seed completed successfully!');

  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed();