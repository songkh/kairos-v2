"use strict";
/**
 * Pace Passport — Elo ベースペースレーティング
 *
 * バンドは GPS 検証済みランおよびインポートされた自己ベストから自動算出。
 * ペースバンドは距離別（5K / 10K / HALF / FULL）に独立管理。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELO_K_FACTOR = exports.ELO_MAX_RATING = exports.ELO_MIN_RATING = exports.ELO_BASE_RATING = exports.PACE_BAND_BOUNDARIES = void 0;
exports.paceToBand = paceToBand;
exports.eloToBand = eloToBand;
/**
 * ペースバンド境界定数（秒/km）
 * minPaceSec: このバンドの最速ペース（0 = 制限なし）
 * maxPaceSec: このバンドの最遅ペース（Infinity = 制限なし）
 */
exports.PACE_BAND_BOUNDARIES = {
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
};
/** 秒/km ペースからペースバンドを算出 */
function paceToBand(paceSec) {
    for (const [band, bounds] of Object.entries(exports.PACE_BAND_BOUNDARIES)) {
        if (paceSec >= bounds.minPaceSec && paceSec <= bounds.maxPaceSec) {
            return band;
        }
    }
    return 'D';
}
// Elo レーティング定数
exports.ELO_BASE_RATING = 1200;
exports.ELO_MIN_RATING = 800;
exports.ELO_MAX_RATING = 2400;
exports.ELO_K_FACTOR = 32;
/** Elo レーティングからペースバンドを算出 */
function eloToBand(elo) {
    if (elo >= 2000)
        return 'S';
    if (elo >= 1600)
        return 'A';
    if (elo >= 1300)
        return 'B';
    if (elo >= 1100)
        return 'C';
    return 'D';
}
//# sourceMappingURL=pace.js.map