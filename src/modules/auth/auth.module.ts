import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PassportModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '900s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
