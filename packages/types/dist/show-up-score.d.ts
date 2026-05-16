/**
 * Show-up Score — イベント出欠履歴に基づく信頼性スコア（0-100）
 *
 * 計算ルール:
 *   - RSVP 後 no-show = ペナルティ
 *   - 直前キャンセル（イベント 1 時間前以降）= 軽ペナルティ
 *   - 履歴 5 件未満 = 「新規」表示（0 表示は 5 件以上のみ）
 *
 * Tier:
 *   Platinum: 90+
 *   Gold:     75-89
 *   Silver:   50-74
 *   Bronze:   25-49
 *   None:     0-24（または新規）
 */
export type ShowUpBadge = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE' | 'NEW';
export interface ShowUpScore {
    userId: string;
    /** RSVP した総イベント数 */
    totalCommitments: number;
    /** 実際に参加したイベント数 */
    attendedCount: number;
    /** 直前キャンセル（イベント 1 時間前以降にキャンセル）数 */
    cancelledLate: number;
    /** ノーショー（参加せず＆キャンセルもせず）数 */
    noShowCount: number;
    /** スコア 0-100（totalCommitments < 5 の場合は null） */
    score: number | null;
    badge: ShowUpBadge;
}
declare const LATE_CANCEL_HOURS = 1;
/** RSVP 履歴から Show-up Score を計算する */
export declare function calculateShowUpScore(params: {
    totalCommitments: number;
    attendedCount: number;
    cancelledLate: number;
    noShowCount: number;
    userId: string;
}): ShowUpScore;
export { LATE_CANCEL_HOURS };
//# sourceMappingURL=show-up-score.d.ts.map