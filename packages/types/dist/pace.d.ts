/**
 * Pace Passport — Elo ベースペースレーティング
 *
 * バンドは GPS 検証済みランおよびインポートされた自己ベストから自動算出。
 * ペースバンドは距離別（5K / 10K / HALF / FULL）に独立管理。
 */
export type PaceCategory = '5K' | '10K' | 'HALF' | 'FULL';
/**
 * ペースバンド
 * S: エリート（〜3:30/km）
 * A: 上級（3:30〜4:30/km）
 * B: 中級（4:30〜5:30/km）
 * C: 初中級（5:30〜6:30/km）
 * D: 初心者（6:30+/km）
 */
export type PaceBand = 'S' | 'A' | 'B' | 'C' | 'D';
/**
 * ペースバンド境界定数（秒/km）
 * minPaceSec: このバンドの最速ペース（0 = 制限なし）
 * maxPaceSec: このバンドの最遅ペース（Infinity = 制限なし）
 */
export declare const PACE_BAND_BOUNDARIES: Record<PaceBand, {
    minPaceSec: number;
    maxPaceSec: number;
    label: string;
    displayLabel: string;
}>;
/** 秒/km ペースからペースバンドを算出 */
export declare function paceToBand(paceSec: number): PaceBand;
export declare const ELO_BASE_RATING = 1200;
export declare const ELO_MIN_RATING = 800;
export declare const ELO_MAX_RATING = 2400;
export declare const ELO_K_FACTOR = 32;
/** Elo レーティングからペースバンドを算出 */
export declare function eloToBand(elo: number): PaceBand;
//# sourceMappingURL=pace.d.ts.map