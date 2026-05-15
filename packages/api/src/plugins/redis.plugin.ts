/**
 * Redis プラグイン
 *
 * USE_MOCKS=true または認証情報未設定の場合はインメモリ Redis を使用する。
 * 本番（NODE_ENV=production）では UPSTASH_REDIS_URL / TOKEN が必須。
 */

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from '@upstash/redis';
import { MemoryRedis } from '@kairos/mocks';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis | MemoryRedis;
  }
}

async function redisPlugin(fastify: FastifyInstance): Promise<void> {
  const url = process.env['UPSTASH_REDIS_URL'];
  const token = process.env['UPSTASH_REDIS_TOKEN'];
  const useMocks = process.env['USE_MOCKS'] === 'true';

  if (!url || !token || useMocks) {
    if (process.env['NODE_ENV'] === 'production' && !useMocks) {
      throw new Error(
        'UPSTASH_REDIS_URL と UPSTASH_REDIS_TOKEN は本番環境で必須です。',
      );
    }
    fastify.log.warn(
      'Redis 認証情報未設定 または USE_MOCKS=true — インメモリ Redis を使用します（開発専用）',
    );
    fastify.decorate('redis', new MemoryRedis());
    return;
  }

  const redis = new Redis({ url, token });
  fastify.decorate('redis', redis);
}

export default fp(redisPlugin, { name: 'redis' });
