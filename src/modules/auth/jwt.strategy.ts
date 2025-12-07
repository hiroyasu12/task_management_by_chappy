import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../redis/redis.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const client = this.redisService.getClient();
    const blacklistKey = `blacklist:access:${payload.jti}`;
    const isBlacklisted = await client.get(blacklistKey);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return payload;
  }
}
