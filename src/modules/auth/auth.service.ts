import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { randomUUID } from 'crypto';
import { JwtPayload } from './jwt-payload.interface';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';


export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redisService: RedisService,
  ) {
    this.accessTtlSeconds = Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900);
    this.refreshTtlSeconds = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800);
  }

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

  async signup(data: SignupDto) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
      },
    });

    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<Tokens> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessPayload: JwtPayload = {
      userId,
      email,
      role,
      jti: accessJti,
    };

    const refreshPayload: JwtPayload = {
      userId,
      email,
      role,
      jti: refreshJti,
    };

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
      expiresIn: this.accessTtlSeconds,
    });

    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: this.refreshTtlSeconds,
    });

    // Redis にリフレッシュトークン（ハッシュ）を保存
    const client = this.redisService.getClient();
    const key = this.getRefreshKey(userId, refreshJti);
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await client.set(key, hashedRefresh, {
      EX: this.refreshTtlSeconds,
    });

    return { accessToken, refreshToken };
  }

  private getRefreshKey(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`;
  }

  private getAccessBlacklistKey(jti: string): string {
    return `blacklist:access:${jti}`;
  }

  async logout(accessTokenPayload: JwtPayload, refreshToken: string): Promise<void> {
    const client = this.redisService.getClient();

    // アクセストークンをブラックリストに追加
    const blacklistKey = this.getAccessBlacklistKey(accessTokenPayload.jti);
    await client.set(blacklistKey, '1', {
      EX: this.accessTtlSeconds,
    });

    // リフレッシュトークン側を無効化
    try {
      const parsed = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });

      const refreshKey = this.getRefreshKey(parsed.userId, parsed.jti);
      await client.del(refreshKey);
    } catch {
      // すでに無効・期限切れの場合は特に何もしない
    }
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const client = this.redisService.getClient();
    const key = this.getRefreshKey(payload.userId, payload.jti);
    const storedHash = (await client.get(key)) as string | null;

    if (!storedHash) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    const isValid = await bcrypt.compare(refreshToken, storedHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    // 1回使った refresh は破棄（ローテーション）
    await client.del(key);

    // 新しいトークンを発行 & 保存
    return this.issueTokens(payload.userId, payload.email, payload.role);
  }


}
