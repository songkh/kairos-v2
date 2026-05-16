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
/** 自宅ぼかし半径（メートル） */
declare const HOME_BLUR_RADIUS_M = 500;
export interface HomeLocation {
    lat: number;
    lng: number;
}
/**
 * 単一座標を自宅ぼかし処理する
 *
 * @returns 自宅 500m 以内なら null（ポリラインのギャップ）、それ以外はそのまま返す
 */
export declare function blurHomeLocation(coord: {
    lat: number;
    lng: number;
}, homeCoord: HomeLocation | null, radiusM?: number): {
    lat: number;
    lng: number;
} | null;
/**
 * GPS トラック全体に自宅ぼかし処理を適用する
 *
 * null になった点はポリライン描画時に「ギャップ」として扱われる
 * クライアントは null 要素を描画でスキップする
 */
export declare function blurGpsTrack(points: GpsPoint[], homeCoord: HomeLocation | null, radiusM?: number): (GpsPoint | null)[];
export { HOME_BLUR_RADIUS_M };
//# sourceMappingURL=home-blur.d.ts.map