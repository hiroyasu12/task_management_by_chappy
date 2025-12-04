import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) return null;

    // password を除外（unused-vars の警告を防ぐ）
    const { password: _password, ...safeUser } = user;
    void _password; // ESLint が unused だと判断しないようにする
    return safeUser;
  }

  async login(user: { id: string; email: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: 'TODO-refresh-token',
    };
  }

  async signup(data: { email: string; password: string; name?: string }) {
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }
}
