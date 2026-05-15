/**
 * 認証エンドポイント
 *
 * POST /api/v1/auth/line    — LINE ログイン
 * POST /api/v1/auth/apple   — Apple Sign In
 * POST /api/v1/auth/google  — Google Sign In
 * POST /api/v1/auth/refresh — リフレッシュトークンローテーション（シングルユース）
 * POST /api/v1/auth/logout  — ログアウト（全セッション失効）
 *
 * レートリミット: 5 req/min/IP（認証エンドポイント）
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { KairosAPIError } from '@kairos/types';
import {
  generateRefreshToken,
  storeRefreshToken,
  rotateRefreshToken,
  invalidateAllUserSessions,
} from '@kairos/auth';
import { generateAccessToken } from '@kairos/auth';
import { prisma } from '../lib/prisma.js';

const LineLoginBody = z.object({
  idToken: z.string().min(1),
  accessToken: z.string().optional(),
});

const AppleLoginBody = z.object({
  identityToken: z.string().min(1),
  authorizationCode: z.string().optional(),
  fullName: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
});

const GoogleLoginBody = z.object({
  idToken: z.string().min(1),
});

const RefreshBody = z.object({
  refreshToken: z.string().min(1),
  userId: z.string().uuid(),
});

export default async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  const jwtSecret = process.env['JWT_SECRET']!;
  const accessTtl = Number(process.env['JWT_ACCESS_TTL_SEC'] ?? 900);
  const refreshTtl = Number(process.env['JWT_REFRESH_TTL_SEC'] ?? 604800);

  // ── LINE ログイン ───────────────────────────────────────────────────────────
  fastify.post(
    '/auth/line',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const parseResult = LineLoginBody.safeParse(request.body);
      if (!parseResult.success) {
        throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
      }

      const { idToken } = parseResult.data;
      const useMocks = process.env['USE_MOCKS'] === 'true';

      let lineUserId: string;
      let displayName: string;
      let pictureUrl: string | undefined;

      if (useMocks) {
        // USE_MOCKS=true: モックユーザーを返す
        lineUserId = 'mock-line-user-001';
        displayName = 'テストランナー';
      } else {
        // 本番: LINE ID トークン検証
        // TODO(kairos-integrations): LINE SDK で idToken を検証する
        throw new KairosAPIError('LINE_AUTH_FAILED', 'LINE 認証の本番実装は kairos-integrations が担当します。', 501);
      }

      // ユーザーを取得または作成（upsert）
      const user = await prisma.user.upsert({
        where: { lineUserId },
        create: {
          lineUserId,
          displayName,
          avatarUrl: pictureUrl,
        },
        update: {
          displayName,
          ...(pictureUrl && { avatarUrl: pictureUrl }),
        },
        select: { id: true, displayName: true, avatarUrl: true, role: true, paceBand: true },
      });

      const accessToken = generateAccessToken(user.id, jwtSecret, accessTtl);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(fastify.redis, user.id, refreshToken, refreshTtl);

      return reply.code(201).send({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user,
        },
      });
    },
  );

  // ── Apple Sign In ──────────────────────────────────────────────────────────
  fastify.post(
    '/auth/apple',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const parseResult = AppleLoginBody.safeParse(request.body);
      if (!parseResult.success) {
        throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
      }

      const useMocks = process.env['USE_MOCKS'] === 'true';
      if (!useMocks) {
        // TODO(kairos-integrations): Apple JWT を検証する
        throw new KairosAPIError('APPLE_AUTH_FAILED', 'Apple 認証の本番実装は kairos-integrations が担当します。', 501);
      }

      const appleUserId = 'mock-apple-user-001';
      const displayName = parseResult.data.fullName?.firstName ?? 'Appleユーザー';

      const user = await prisma.user.upsert({
        where: { appleUserId },
        create: { appleUserId, displayName },
        update: { displayName },
        select: { id: true, displayName: true, avatarUrl: true, role: true, paceBand: true },
      });

      const accessToken = generateAccessToken(user.id, jwtSecret, accessTtl);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(fastify.redis, user.id, refreshToken, refreshTtl);

      return reply.code(201).send({
        success: true,
        data: { accessToken, refreshToken, user },
      });
    },
  );

  // ── リフレッシュトークンローテーション ───────────────────────────────────────
  // シングルユースローテーション + ファミリー検出（security.md §1）
  fastify.post(
    '/auth/refresh',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const parseResult = RefreshBody.safeParse(request.body);
      if (!parseResult.success) {
        throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
      }

      const { refreshToken, userId } = parseResult.data;

      // ユーザー存在確認
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        throw new KairosAPIError('UNAUTHORIZED', '再ログインが必要です。', 401);
      }

      // シングルユースローテーション（ファミリー検出含む）
      const newRefreshToken = await rotateRefreshToken(
        fastify.redis,
        userId,
        refreshToken,
        refreshTtl,
      );

      const newAccessToken = generateAccessToken(userId, jwtSecret, accessTtl);

      return reply.send({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    },
  );

  // ── ログアウト ─────────────────────────────────────────────────────────────
  fastify.post(
    '/auth/logout',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      await invalidateAllUserSessions(fastify.redis, userId);

      return reply.send({ success: true });
    },
  );
}
