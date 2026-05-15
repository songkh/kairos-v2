/**
 * レートリミットプラグイン
 *
 * エンドポイント別レート制限（.claude/rules/security.md §10）:
 *   /auth/*                  5 req/min/IP
 *   /activities（GPS 記録）  100 req/min/user
 *   /live/position           12 req/min/user（5 秒ポーリング相当）
 *   /coaching/suggest（AI）  5 req/day/user（Claude API コスト管理）
 */

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

async function rateLimitPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(rateLimit, {
    // デフォルト: 100 req/min/IP
    max: 100,
    timeWindow: '1 minute',
    // Redis をキャッシュストアとして使う（USE_MOCKS 時はインメモリにフォールバック）
    redis: fastify.redis as Parameters<typeof rateLimit>[0]['redis'],
    keyGenerator: (request) => {
      // 認証済みリクエストはユーザー ID ベース
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      const path = request.routeOptions?.url ?? request.url;
      if (userId) return `rate:${userId}:${path}`;
      // 未認証はIP ベース
      return `rate:${request.ip}:${path}`;
    },
  });
}

export default fp(rateLimitPlugin, { name: 'rate-limit', dependencies: ['redis', 'auth'] });
