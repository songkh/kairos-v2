"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_HUMAN_SPEED_KPH = exports.GPS_ACCURACY_THRESHOLD_M = void 0;
exports.validateGpsTrack = validateGpsTrack;
exports.calculateDistance = calculateDistance;
exports.calculateAvgPace = calculateAvgPace;
const haversine_js_1 = require("./haversine.js");
/** GPS 精度閾値（この値を超える点は速度チェックをスキップ） */
const GPS_ACCURACY_THRESHOLD_M = 50;
exports.GPS_ACCURACY_THRESHOLD_M = GPS_ACCURACY_THRESHOLD_M;
/** 人間が移動できる最大速度（km/h）— 自転車上限を考慮 */
const MAX_HUMAN_SPEED_KPH = 100;
exports.MAX_HUMAN_SPEED_KPH = MAX_HUMAN_SPEED_KPH;
/**
 * GPS トラックから不正点を除去する
 *
 * @param points 生の GPS ポイント列（時系列順）
 * @returns 速度検証済みポイント列（不正点は除去）
 */
function validateGpsTrack(points) {
    if (points.length <= 1)
        return points;
    return points.filter((point, i) => {
        if (i === 0)
            return true;
        const prev = points[i - 1];
        if (!prev)
            return false;
        // GPS 精度が悪い点はスキップ（accuracy チェックをバイパス — 点は残す）
        // accuracy > 50m の場合、速度は信頼できないが点自体は記録する
        if (point.accuracy > GPS_ACCURACY_THRESHOLD_M || prev.accuracy > GPS_ACCURACY_THRESHOLD_M) {
            return true;
        }
        const distanceM = (0, haversine_js_1.haversineDistance)({ lat: prev.lat, lng: prev.lng }, { lat: point.lat, lng: point.lng });
        const timeDiffS = (point.timestamp - prev.timestamp) / 1000;
        // 時間差が 0 以下の場合は異常データとして除去
        if (timeDiffS <= 0)
            return false;
        const speedKph = (distanceM / timeDiffS) * 3.6;
        // 人間の最大速度を超える点は不正データとして除去
        return speedKph <= MAX_HUMAN_SPEED_KPH;
    });
}
/**
 * GPS トラックから実走行距離（メートル）を計算する
 */
function calculateDistance(points) {
    if (points.length < 2)
        return 0;
    let totalM = 0;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        if (!prev || !curr)
            continue;
        totalM += (0, haversine_js_1.haversineDistance)({ lat: prev.lat, lng: prev.lng }, { lat: curr.lat, lng: curr.lng });
    }
    return totalM;
}
/**
 * GPS トラックから平均ペース（秒/km）を計算する
 */
function calculateAvgPace(points, durationSec) {
    const distanceKm = calculateDistance(points) / 1000;
    if (distanceKm === 0)
        return 0;
    return durationSec / distanceKm;
}
//# sourceMappingURL=gps-validation.js.map