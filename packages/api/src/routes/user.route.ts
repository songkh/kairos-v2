/**
 * ユーザープロフィール CRUD エンドポイント
 *
 * GET  /api/v1/users/me          — 自分のプロフィール取得
 * PUT  /api/v1/users/me          — プロフィール更新
 * GET  /api/v1/users/me/data-export — APPI: 全データエクスポート
 * DELETE /api/v1/users/me        — APPI: アカウント削除（カスケード）
 * GET  /api/v1/users/:id         — 他ユーザーのパブリックプロフィール
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { KairosAPIError } from '@kairos/types';
import { prisma } from '../lib/prisma.js';

const UpdateProfileBody = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).nullable().optional(),
});

export default async function userRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // ── 自分のプロフィール取得 ──────────────────────────────────────────────────
  fastify.get('/users/me', { preHandler: [fastify.authenticate] }, async (request, _reply) => {
    const userId = request.user.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        paceBand: true,
        createdAt: true,
        // APPI: homeLatitude / homeLongitude は絶対に含めない
      },
    });

    if (!user) {
      throw new KairosAPIError('USER_NOT_FOUND', 'ユーザーが見つかりません。', 404);
    }

    return { success: true, data: user };
  });

  // ── プロフィール更新 ───────────────────────────────────────────────────────
  fastify.put('/users/me', { preHandler: [fastify.authenticate] }, async (request, _reply) => {
    const userId = request.user.sub;
    const parseResult = UpdateProfileBody.safeParse(request.body);
    if (!parseResult.success) {
      throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
    }

    const { displayName, bio } = parseResult.data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        paceBand: true,
        createdAt: true,
      },
    });

    return { success: true, data: user };
  });

  // ── APPI: 全データエクスポート ─────────────────────────────────────────────
  fastify.get(
    '/users/me/data-export',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;

      const [user, activities] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            role: true,
            paceBand: true,
            createdAt: true,
          },
        }),
        prisma.activity.findMany({
          where: { userId },
          select: {
            id: true,
            type: true,
            privacy: true,
            distanceM: true,
            durationSec: true,
            avgPaceSec: true,
            elevationGainM: true,
            avgHeartRate: true,
            startedAt: true,
            finishedAt: true,
            gpsTrack: true, // APPI エクスポートには GPS 座標を含める
            createdAt: true,
          },
          orderBy: { startedAt: 'desc' },
        }),
      ]);

      if (!user) {
        throw new KairosAPIError('USER_NOT_FOUND', 'ユーザーが見つかりません。', 404);
      }

      reply.header('Content-Disposition', `attachment; filename="kairos-data-export-${userId}.json"`);
      reply.header('Content-Type', 'application/json');

      return reply.send({
        exportedAt: new Date().toISOString(),
        user,
        activities,
      });
    },
  );

  // ── APPI: アカウント削除（カスケード）─────────────────────────────────────
  // Prisma スキーマの onDelete: Cascade により全関連データが削除される
  fastify.delete(
    '/users/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;

      // Redis のリフレッシュトークンも削除
      await fastify.redis.del(`jwt_refresh:${userId}`);

      // DB からカスケード削除（activities, pace_ratings 等も削除）
      await prisma.user.delete({ where: { id: userId } });

      return reply.code(204).send();
    },
  );

  // ── 他ユーザーのパブリックプロフィール ────────────────────────────────────
  fastify.get(
    '/users/:id',
    { preHandler: [fastify.authenticate] },
    async (request, _reply) => {
      const { id } = request.params as { id: string };

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          paceBand: true,
          createdAt: true,
          // APPI: homeLatitude / homeLongitude は絶対に含めない
          // role は含めない（プライバシー）
        },
      });

      if (!user) {
        throw new KairosAPIError('USER_NOT_FOUND', 'ユーザーが見つかりません。', 404);
      }

      return { success: true, data: user };
    },
  );
}
