import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../modules/rbac/entities/user.entity'; // ← RBAC User
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { RbacModule } from '../modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    TypeOrmModule.forFeature([User, UserRole, Role]), // ← Inject repos directly
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'corpflow-secret-key-change-me'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
