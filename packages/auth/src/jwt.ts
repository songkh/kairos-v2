/**
 * JWT アクセストークン生成・検証
 *
 * - アクセストークン: TTL 15 分（JWT_ACCESS_TTL_SEC）
 * - ペイロードには sub（userId）のみ格納
 * - role は毎回 DB からフェッチ（JWT クレームに role を入れない）
 */

import jwt from 'jsonwebtoken';
import { KairosAPIError } from '@kairos/types';

export interface JwtPayload {
  sub: string;
}

export function generateAccessToken(
  userId: string,
  secret: string,
  ttlSec = 900,
): string {
  return jwt.sign({ sub: userId } satisfies JwtPayload, secret, {
    expiresIn: ttlSec,
  });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  try {
    const payload = jwt.verify(token, secret) as JwtPayload & { exp?: number };
    return { sub: payload.sub };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new KairosAPIError('TOKEN_EXPIRED', 'トークンの有効期限が切れています。', 401);
    }
    throw new KairosAPIError('INVALID_TOKEN', '無効なトークンです。', 401);
  }
}
