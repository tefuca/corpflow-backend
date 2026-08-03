# CRMS Backend

Corporate Resource Management System - NestJS Backend

## Windows Setup

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 14+ (https://www.postgresql.org/download/windows/)
- Git (https://git-scm.com/download/win)

### Installation

```powershell
# 1. Install dependencies
npm install

# 2. Create .env file
copy .env.example .env
# Edit .env with your database credentials

# 3. Create database in PostgreSQL
# Open pgAdmin or psql:
CREATE DATABASE crms_db;

# 4. Run database seed
npm run seed

# 5. Start development server
npm run start:dev

# 6. Access API docs
# http://localhost:3000/api/docs
```

### Default Login
- Username: `admin`
- Password: `admin123`

### Production
```powershell
npm run build
npm run start:prod
```
