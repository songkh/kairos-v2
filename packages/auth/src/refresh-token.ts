/**
 * JWT リフレッシュトークン — シングルユースローテーション + ファミリー検出
 *
 * セキュリティルール（.claude/rules/security.md §1 より）:
 *   1. リフレッシュトークンは 1 回使用したら即座に無効化 → 新しいトークンを発行
 *   2. 同一トークンが 2 回使用された場合（リプレイアタック）
 *      → そのユーザーの全セッションを失効させる（ファミリー検出）
 *
 * Redis キー:
 *   jwt_refresh:{userId}  TTL 7 日
 *
 * テスト検証シナリオ:
 *   1. T1 で /auth/refresh → T2 取得
 *   2. T1 で再度 /auth/refresh → 401 + T2 も無効化される
 */

import { randomBytes } from 'crypto';
import { KairosAPIError } from '@kairos/types';

/**
 * Redis インターフェース（Upstash Redis または MemoryRedis と互換）
 * Fastify プラグインから注入される
 */
export interface RefreshTokenRedis {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
}

export function generateRefreshToken(): string {
  // 256bit ランダム文字列（URL-safe base64）
  return randomBytes(32).toString('base64url');
}

/**
 * リフレッシュトークンを Redis に保存する
 */
export async function storeRefreshToken(
  redis: RefreshTokenRedis,
  userId: string,
  token: string,
  ttlSec = 604800,
): Promise<void> {
  await redis.set(`jwt_refresh:${userId}`, token, { ex: ttlSec });
}

/**
 * リフレッシュトークンをローテーションする
 *
 * @throws KairosAPIError（UNAUTHORIZED） — トークン不一致またはリプレイアタック検出時
 */
export async function rotateRefreshToken(
  redis: RefreshTokenRedis,
  userId: string,
  incomingToken: string,
  ttlSec = 604800,
): Promise<string> {
  const stored = await redis.get<string>(`jwt_refresh:${userId}`);

  if (!stored) {
    // トークンが Redis に存在しない
    // = すでに使用済み（別デバイスで rotate 済み）or 有効期限切れ
    // リプレイアタックの可能性 → 全セッション失効（ファミリー検出）
    await invalidateAllUserSessions(redis, userId);
    throw new KairosAPIError(
      'UNAUTHORIZED',
      '再ログインが必要です。セキュリティ上の理由から全セッションを終了しました。',
      401,
    );
  }

  if (stored !== incomingToken) {
    // トークン不一致 = ファミリー検出（盗まれたトークンの使用）
    // → 正規ユーザーを守るため全セッション失効
    await invalidateAllUserSessions(redis, userId);
    throw new KairosAPIError(
      'UNAUTHORIZED',
      '再ログインが必要です。セキュリティ上の理由から全セッションを終了しました。',
      401,
    );
  }

  // 旧トークンを即削除（シングルユース）
  await redis.del(`jwt_refresh:${userId}`);

  // 新トークンを発行
  const newToken = generateRefreshToken();
  await storeRefreshToken(redis, userId, newToken, ttlSec);

  return newToken;
}

/**
 * ユーザーの全セッションを失効させる
 * （ファミリー検出時 + 明示的ログアウト時）
 */
export async function invalidateAllUserSessions(
  redis: RefreshTokenRedis,
  userId: string,
): Promise<void> {
  await redis.del(`jwt_refresh:${userId}`);
}
