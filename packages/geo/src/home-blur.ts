/**
 * 自宅 500m ぼかし処理
 *
 * APPI（個人情報保護法）対応:
 *   - GPS 座標は要配慮個人情報
 *   - 自宅から 500m 以内の座標を全 API レスポンスからサーバーサイドで除去
 *   - クライアント側での除去は禁止（バイパス可能）
 *   - null を返した座標はポリライン描画時に「ギャップ」として扱う
 *
 * セキュリティルール（.claude/rules/security.md §4 より）
 */

import type { GpsPoint } from '@kairos/types';
import { haversineDistance } from './haversine.js';

/** 自宅ぼかし半径（メートル） */
const HOME_BLUR_RADIUS_M = 500;

export interface HomeLocation {
  lat: number;
  lng: number;
}

/**
 * 単一座標を自宅ぼかし処理する
 *
 * @returns 自宅 500m 以内なら null（ポリラインのギャップ）、それ以外はそのまま返す
 */
export function blurHomeLocation(
  coord: { lat: number; lng: number },
  homeCoord: HomeLocation | null,
  radiusM = HOME_BLUR_RADIUS_M,
): { lat: number; lng: number } | null {
  // APPI: 自宅 500m 以内の座標は全 API レスポンスから除去
  if (!homeCoord) return coord;

  const distance = haversineDistance(coord, homeCoord);
  return distance < radiusM ? null : coord;
}

/**
 * GPS トラック全体に自宅ぼかし処理を適用する
 *
 * null になった点はポリライン描画時に「ギャップ」として扱われる
 * クライアントは null 要素を描画でスキップする
 */
export function blurGpsTrack(
  points: GpsPoint[],
  homeCoord: HomeLocation | null,
  radiusM = HOME_BLUR_RADIUS_M,
): (GpsPoint | null)[] {
  // APPI: 全 API レスポンスからサーバーサイドで除去（クライアント側禁止）
  if (!homeCoord) return points;

  return points.map((point) => {
    const blurred = blurHomeLocation({ lat: point.lat, lng: point.lng }, homeCoord, radiusM);
    return blurred === null ? null : point;
  });
}

export { HOME_BLUR_RADIUS_M };
