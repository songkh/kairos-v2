/**
 * アクティビティ記録・履歴 API
 *
 * POST /api/v1/activities        — アクティビティ記録
 * GET  /api/v1/activities        — 自分のアクティビティ履歴
 * GET  /api/v1/activities/:id    — アクティビティ詳細
 * PUT  /api/v1/activities/:id    — プライバシー設定変更
 * DELETE /api/v1/activities/:id  — アクティビティ削除
 *
 * レートリミット: 100 req/min/user（GPS 記録エンドポイント）
 *
 * セキュリティ:
 *   - GPS 速度検証（連続点間速度 + accuracy 判定）
 *   - 自宅 500m ぼかし（API レスポンスからサーバーサイドで除去）
 *   - GPS 座標を console.log に出力しない（APPI）
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { KairosAPIError } from '@kairos/types';
import { validateGpsTrack, blurGpsTrack } from '@kairos/geo';
import { prisma } from '../lib/prisma.js';

const GpsPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  timestamp: z.number().int(),
  altitude: z.number().optional(),
  heartRate: z.number().int().min(30).max(250).optional(),
});

const CreateActivityBody = z.object({
  type: z.enum(['RUN', 'WALK', 'TRAIL_RUN', 'VIRTUAL_RUN']).default('RUN'),
  privacy: z.enum(['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']).default('PRIVATE'),
  distanceM: z.number().min(0),
  durationSec: z.number().int().min(0),
  // GPS 座標を console.log に出力しない（APPI）
  gpsTrack: z.array(GpsPointSchema).optional(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  isManual: z.boolean().default(false),
  title: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  elevationGainM: z.number().min(0).optional(),
});

const UpdateActivityBody = z.object({
  privacy: z.enum(['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']).optional(),
  title: z.string().max(100).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
});

export default async function activityRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // ── アクティビティ記録 ──────────────────────────────────────────────────────
  fastify.post(
    '/activities',
    {
      preHandler: [fastify.authenticate],
      config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const userId = request.user.sub;
      const parseResult = CreateActivityBody.safeParse(request.body);
      if (!parseResult.success) {
        throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
      }

      const input = parseResult.data;

      // GPS 速度検証（連続点間速度 + accuracy 判定 — 固定 300km/h 閾値禁止）
      let validatedTrack = input.gpsTrack ?? [];
      if (validatedTrack.length > 0) {
        validatedTrack = validateGpsTrack(validatedTrack);
      }

      // 自宅ぼかし処理: 自宅座標を取得
      const userWithHome = await prisma.user.findUnique({
        where: { id: userId },
        select: { homeLatitude: true, homeLongitude: true },
      });

      const homeCoord =
        userWithHome?.homeLatitude !== null && userWithHome?.homeLongitude !== null
          ? { lat: userWithHome.homeLatitude!, lng: userWithHome.homeLongitude! }
          : null;

      // APPI: 自宅 500m 以内の座標をサーバーサイドで除去
      const blurredTrack = blurGpsTrack(validatedTrack, homeCoord);
      // null 要素を除去（ポリライン描画時にクライアントがギャップ処理）
      const storedTrack = blurredTrack.filter(Boolean);

      // 平均ペース計算
      const distanceKm = input.distanceM / 1000;
      const avgPaceSec = distanceKm > 0 ? input.durationSec / distanceKm : 0;

      const activity = await prisma.activity.create({
        data: {
          userId,
          type: input.type,
          privacy: input.privacy,
          distanceM: input.distanceM,
          durationSec: input.durationSec,
          avgPaceSec,
          elevationGainM: input.elevationGainM,
          gpsTrack: storedTrack.length > 0 ? storedTrack : undefined,
          startedAt: new Date(input.startedAt),
          finishedAt: new Date(input.finishedAt),
          isManual: input.isManual,
          title: input.title,
          description: input.description,
        },
        select: {
          id: true,
          type: true,
          privacy: true,
          distanceM: true,
          durationSec: true,
          avgPaceSec: true,
          elevationGainM: true,
          startedAt: true,
          finishedAt: true,
          isManual: true,
          title: true,
          createdAt: true,
          // gpsTrack は作成レスポンスに含めない（レスポンスサイズ節約）
        },
      });

      return reply.code(201).send({ success: true, data: activity });
    },
  );

  // ── アクティビティ履歴一覧 ─────────────────────────────────────────────────
  fastify.get(
    '/activities',
    { preHandler: [fastify.authenticate] },
    async (request, _reply) => {
      const userId = request.user.sub;
      const { cursor, limit = '20' } = request.query as {
        cursor?: string;
        limit?: string;
      };

      const pageLimit = Math.min(Number(limit), 50);

      const activities = await prisma.activity.findMany({
        where: {
          userId,
          ...(cursor && {
            startedAt: { lt: new Date(cursor) },
          }),
        },
        orderBy: { startedAt: 'desc' },
        take: pageLimit + 1,
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
          isManual: true,
          title: true,
          createdAt: true,
        },
      });

      const hasMore = activities.length > pageLimit;
      const items = hasMore ? activities.slice(0, pageLimit) : activities;
      const nextCursor = hasMore ? items[items.length - 1]?.startedAt.toISOString() : undefined;

      return {
        success: true,
        data: items,
        meta: { hasMore, nextCursor },
      };
    },
  );

  // ── アクティビティ詳細 ─────────────────────────────────────────────────────
  fastify.get(
    '/activities/:id',
    { preHandler: [fastify.authenticate] },
    async (request, _reply) => {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };

      const activity = await prisma.activity.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          type: true,
          privacy: true,
          distanceM: true,
          durationSec: true,
          avgPaceSec: true,
          elevationGainM: true,
          avgHeartRate: true,
          maxHeartRate: true,
          startedAt: true,
          finishedAt: true,
          isManual: true,
          title: true,
          description: true,
          gpsTrack: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              // APPI: homeLatitude/homeLongitude は含めない
            },
          },
        },
      });

      if (!activity) {
        throw new KairosAPIError('ACTIVITY_NOT_FOUND', 'アクティビティが見つかりません。', 404);
      }

      // 自分以外のアクティビティは privacy 設定を確認
      if (activity.userId !== userId) {
        if (activity.privacy === 'PRIVATE') {
          // OGP と同様に存在を秘匿するため 404 を返す
          throw new KairosAPIError('ACTIVITY_NOT_FOUND', 'アクティビティが見つかりません。', 404);
        }
        // TODO(kairos-backend): FOLLOWERS_ONLY はフォロー状態を確認する
      }

      // 他ユーザーのアクティビティには GPS トラックを返す前に自宅ぼかしを適用
      if (activity.userId !== userId && activity.gpsTrack) {
        const owner = await prisma.user.findUnique({
          where: { id: activity.userId },
          select: { homeLatitude: true, homeLongitude: true },
        });
        const homeCoord =
          owner?.homeLatitude !== null && owner?.homeLongitude !== null
            ? { lat: owner!.homeLatitude!, lng: owner!.homeLongitude! }
            : null;

        const blurred = blurGpsTrack(
          activity.gpsTrack as Parameters<typeof blurGpsTrack>[0],
          homeCoord,
        );
        return {
          success: true,
          data: { ...activity, gpsTrack: blurred.filter(Boolean) },
        };
      }

      return { success: true, data: activity };
    },
  );

  // ── プライバシー設定変更 ──────────────────────────────────────────────────
  fastify.put(
    '/activities/:id',
    { preHandler: [fastify.authenticate] },
    async (request, _reply) => {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };
      const parseResult = UpdateActivityBody.safeParse(request.body);
      if (!parseResult.success) {
        throw new KairosAPIError('VALIDATION_ERROR', 'リクエストの形式が正しくありません。', 400);
      }

      const existing = await prisma.activity.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing) {
        throw new KairosAPIError('ACTIVITY_NOT_FOUND', 'アクティビティが見つかりません。', 404);
      }

      if (existing.userId !== userId) {
        throw new KairosAPIError('FORBIDDEN', 'このアクティビティを更新する権限がありません。', 403);
      }

      const updated = await prisma.activity.update({
        where: { id },
        data: parseResult.data,
        select: {
          id: true,
          type: true,
          privacy: true,
          distanceM: true,
          durationSec: true,
          avgPaceSec: true,
          startedAt: true,
          title: true,
          createdAt: true,
        },
      });

      return { success: true, data: updated };
    },
  );

  // ── アクティビティ削除 ─────────────────────────────────────────────────────
  fastify.delete(
    '/activities/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };

      const existing = await prisma.activity.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing) {
        throw new KairosAPIError('ACTIVITY_NOT_FOUND', 'アクティビティが見つかりません。', 404);
      }

      if (existing.userId !== userId) {
        throw new KairosAPIError('FORBIDDEN', 'このアクティビティを削除する権限がありません。', 403);
      }

      await prisma.activity.delete({ where: { id } });

      return reply.code(204).send();
    },
  );
}
