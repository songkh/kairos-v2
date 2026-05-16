"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOME_BLUR_RADIUS_M = void 0;
exports.blurHomeLocation = blurHomeLocation;
exports.blurGpsTrack = blurGpsTrack;
const haversine_js_1 = require("./haversine.js");
/** 自宅ぼかし半径（メートル） */
const HOME_BLUR_RADIUS_M = 500;
exports.HOME_BLUR_RADIUS_M = HOME_BLUR_RADIUS_M;
/**
 * 単一座標を自宅ぼかし処理する
 *
 * @returns 自宅 500m 以内なら null（ポリラインのギャップ）、それ以外はそのまま返す
 */
function blurHomeLocation(coord, homeCoord, radiusM = HOME_BLUR_RADIUS_M) {
    // APPI: 自宅 500m 以内の座標は全 API レスポンスから除去
    if (!homeCoord)
        return coord;
    const distance = (0, haversine_js_1.haversineDistance)(coord, homeCoord);
    return distance < radiusM ? null : coord;
}
/**
 * GPS トラック全体に自宅ぼかし処理を適用する
 *
 * null になった点はポリライン描画時に「ギャップ」として扱われる
 * クライアントは null 要素を描画でスキップする
 */
function blurGpsTrack(points, homeCoord, radiusM = HOME_BLUR_RADIUS_M) {
    // APPI: 全 API レスポンスからサーバーサイドで除去（クライアント側禁止）
    if (!homeCoord)
        return points;
    return points.map((point) => {
        const blurred = blurHomeLocation({ lat: point.lat, lng: point.lng }, homeCoord, radiusM);
        return blurred === null ? null : point;
    });
}
//# sourceMappingURL=home-blur.js.map