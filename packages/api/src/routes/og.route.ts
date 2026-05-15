/**
 * OGP エンドポイント
 *
 * セキュリティルール（.claude/rules/security.md §2）:
 *   - PRIVATE / FOLLOWERS_ONLY アクティビティ → 404 を返す
 *   - 403 は禁止（リソースの存在を確認できるため列挙攻撃が可能になる）
 *
 * GET /og/activities/:id — アクティビティ OGP 画像
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '../lib/prisma.js';

export default async function ogRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.get('/activities/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        privacy: true,
        type: true,
        distanceM: true,
        durationSec: true,
        avgPaceSec: true,
        startedAt: true,
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // リソースなし → 404
    if (!activity) return reply.code(404).send();

    // OGP: PRIVATE または FOLLOWERS_ONLY → 404（403 ではない）
    // 403 はリソースの存在を確認できるため列挙攻撃が可能になる
    if (activity.privacy !== 'PUBLIC') return reply.code(404).send();

    // 公開アクティビティのみ OGP メタデータを返す
    // TODO(kairos-web): next/og で実際の画像生成を実装
    const distanceKm = (activity.distanceM / 1000).toFixed(2);
    const paceMin = Math.floor(activity.avgPaceSec / 60);
    const paceSec = Math.round(activity.avgPaceSec % 60);

    return reply.send({
      title: `${activity.user.displayName}の${activity.type === 'RUN' ? 'ラン' : 'ウォーク'}`,
      description: `${distanceKm}km | ${paceMin}:${String(paceSec).padStart(2, '0')}/km`,
      image: `${process.env['API_BASE_URL'] ?? 'http://localhost:3001'}/og/activities/${id}/image`,
    });
  });
}
