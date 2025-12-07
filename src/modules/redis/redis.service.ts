import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST ?? 'redis',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      database: Number(process.env.REDIS_DB ?? 0),
    });

    this.client.on('error', (err) => {
      // 本番なら logger を使う
      // eslint-disable-next-line no-console
      console.error('Redis error', err);
    });

    void this.client.connect();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
