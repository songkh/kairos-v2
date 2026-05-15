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
export const PACE_BAND_BOUNDARIES: Record<
  PaceBand,
  { minPaceSec: number; maxPaceSec: number; label: string; displayLabel: string }
> = {
  S: {
    minPaceSec: 0,
    maxPaceSec: 209,
    label: '〜3:30/km エリート',
    displayLabel: 'S — 3:30/km 未満',
  },
  A: {
    minPaceSec: 210,
    maxPaceSec: 269,
    label: '3:30〜4:30/km 上級',
    displayLabel: 'A — 3:30〜4:30/km',
  },
  B: {
    minPaceSec: 270,
    maxPaceSec: 329,
    label: '4:30〜5:30/km 中級',
    displayLabel: 'B — 4:30〜5:30/km（フルマラソン 4〜5 時間）',
  },
  C: {
    minPaceSec: 330,
    maxPaceSec: 389,
    label: '5:30〜6:30/km 初中級',
    displayLabel: 'C — 5:30〜6:30/km',
  },
  D: {
    minPaceSec: 390,
    maxPaceSec: Infinity,
    label: '6:30〜/km 初心者',
    displayLabel: 'D — 6:30/km 以上',
  },
} as const;

/** 秒/km ペースからペースバンドを算出 */
export function paceToBand(paceSec: number): PaceBand {
  for (const [band, bounds] of Object.entries(PACE_BAND_BOUNDARIES) as [
    PaceBand,
    (typeof PACE_BAND_BOUNDARIES)[PaceBand],
  ][]) {
    if (paceSec >= bounds.minPaceSec && paceSec <= bounds.maxPaceSec) {
      return band;
    }
  }
  return 'D';
}

// Elo レーティング定数
export const ELO_BASE_RATING = 1200;
export const ELO_MIN_RATING = 800;
export const ELO_MAX_RATING = 2400;
export const ELO_K_FACTOR = 32;

/** Elo レーティングからペースバンドを算出 */
export function eloToBand(elo: number): PaceBand {
  if (elo >= 2000) return 'S';
  if (elo >= 1600) return 'A';
  if (elo >= 1300) return 'B';
  if (elo >= 1100) return 'C';
  return 'D';
}
