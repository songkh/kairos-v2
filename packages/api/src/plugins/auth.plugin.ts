/**
 * JWT 認証プラグイン
 *
 * - アクセストークン: JWT（TTL 15 分、JWT_ACCESS_TTL_SEC）
 * - リフレッシュトークン: ランダム文字列（TTL 7 日、Upstash Redis に保存）
 * - JWT ペイロードには sub（userId）のみ格納（role は DB から毎回フェッチ）
 *
 * セキュリティ:
 *   - リフレッシュトークンはシングルユースローテーション（.claude/rules/security.md §1）
 *   - ファミリー検出: 同一トークン 2 回使用 → 全セッション失効
 */

import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { KairosAPIError } from '@kairos/types';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET が設定されていません。');
  }

  await fastify.register(jwt, { secret });

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch {
        throw new KairosAPIError('UNAUTHORIZED', '認証が必要です。', 401);
      }
    },
  );
}

export default fp(authPlugin, { name: 'auth' });
