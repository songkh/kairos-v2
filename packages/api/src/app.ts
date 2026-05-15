/**
 * Fastify アプリケーションセットアップ
 *
 * プラグイン登録順序:
 *   1. Redis（認証プラグインより先）
 *   2. 認証（JWT）
 *   3. レートリミット
 *   4. ルート
 *   5. グローバルエラーハンドラー
 */

import { randomUUID } from 'crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { KairosAPIError } from '@kairos/types';
import redisPlugin from './plugins/redis.plugin.js';
import authPlugin from './plugins/auth.plugin.js';
import rateLimitPlugin from './plugins/rate-limit.plugin.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import activityRoutes from './routes/activity.route.js';
import ogRoutes from './routes/og.route.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  });

  // application/json;charset=utf-8 等の charset 付き Content-Type もパース
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      try {
        done(null, JSON.parse(body as string));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.register(cors, {
    origin: [
      process.env['WEB_BASE_URL'] ?? 'http://localhost:3000',
      // Expo アプリからのアクセス（開発時）
      /^http:\/\/localhost:\d+$/,
    ],
    credentials: true,
  });

  // ── プラグイン ──────────────────────────────────────────────────────────────
  app.register(redisPlugin);
  app.register(authPlugin);
  app.register(rateLimitPlugin);

  // ── ヘルスチェック ──────────────────────────────────────────────────────────
  app.get('/health', async (_request, reply) => {
    reply.header('x-request-id', randomUUID());
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
    });
  });

  // ── API ルート ───────────────────────────────────────────────────────────────
  app.register(authRoutes, { prefix: '/api/v1' });
  app.register(userRoutes, { prefix: '/api/v1' });
  app.register(activityRoutes, { prefix: '/api/v1' });
  // OGP エンドポイント（PRIVATE → 404 必須）
  app.register(ogRoutes, { prefix: '/og' });

  // ── グローバルエラーハンドラー ────────────────────────────────────────────
  app.setErrorHandler((error: unknown, _request, reply) => {
    const requestId = randomUUID();
    reply.header('x-request-id', requestId);

    if (error instanceof KairosAPIError) {
      app.log.info(
        { code: error.code, statusCode: error.statusCode, requestId },
        error.message,
      );
      return reply.code(error.statusCode).send({
        success: false,
        error: error.toResponse(),
      });
    }

    const fastifyError = error as { statusCode?: number; message?: string };

    // Fastify のバリデーションエラー（スキーマ検証失敗）
    if (fastifyError.statusCode === 400) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: fastifyError.message,
        },
      });
    }

    // レートリミット
    if (fastifyError.statusCode === 429) {
      return reply.code(429).send({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'リクエスト数が上限を超えました。しばらく待ってから再試行してください。',
        },
      });
    }

    app.log.error({ error, requestId }, '予期しないエラーが発生しました。');

    return reply.code(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました。',
        ...(process.env['NODE_ENV'] !== 'production' && { details: fastifyError.message }),
      },
    });
  });

  return app;
}
