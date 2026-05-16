/**
 * GPS 速度検証ロジック
 *
 * セキュリティルール（.claude/rules/security.md §3 より）:
 *   - 固定 300km/h 閾値は禁止（都市部トンネル出口で誤検知する）
 *   - 連続点間速度 + GPS accuracy 判定を使う
 *   - accuracy > 50m の点は信頼できないためスキップ
 *   - 人間が移動できる最大速度: 100km/h（自転車上限考慮）
 *
 * GPS 座標を console.log に出力しないこと（APPI）
 */
import type { GpsPoint } from '@kairos/types';
/** GPS 精度閾値（この値を超える点は速度チェックをスキップ） */
declare const GPS_ACCURACY_THRESHOLD_M = 50;
/** 人間が移動できる最大速度（km/h）— 自転車上限を考慮 */
declare const MAX_HUMAN_SPEED_KPH = 100;
/**
 * GPS トラックから不正点を除去する
 *
 * @param points 生の GPS ポイント列（時系列順）
 * @returns 速度検証済みポイント列（不正点は除去）
 */
export declare function validateGpsTrack(points: GpsPoint[]): GpsPoint[];
/**
 * GPS トラックから実走行距離（メートル）を計算する
 */
export declare function calculateDistance(points: GpsPoint[]): number;
/**
 * GPS トラックから平均ペース（秒/km）を計算する
 */
export declare function calculateAvgPace(points: GpsPoint[], durationSec: number): number;
export { GPS_ACCURACY_THRESHOLD_M, MAX_HUMAN_SPEED_KPH };
//# sourceMappingURL=gps-validation.d.ts.map