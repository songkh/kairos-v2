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

const LATE_CANCEL_HOURS = 1;

/** RSVP 履歴から Show-up Score を計算する */
export function calculateShowUpScore(params: {
  totalCommitments: number;
  attendedCount: number;
  cancelledLate: number;
  noShowCount: number;
  userId: string;
}): ShowUpScore {
  const { totalCommitments, attendedCount, cancelledLate, noShowCount, userId } = params;

  // 履歴 5 件未満は「新規」
  if (totalCommitments < 5) {
    return {
      userId,
      totalCommitments,
      attendedCount,
      cancelledLate,
      noShowCount,
      score: null,
      badge: 'NEW',
    };
  }

  // スコア計算: ベース 100 点から減点方式
  // no-show: -15 点/件
  // 直前キャンセル: -5 点/件
  const penalty = noShowCount * 15 + cancelledLate * 5;
  const maxPenalty = totalCommitments * 15;
  const normalizedPenalty = Math.min(penalty, maxPenalty);
  const rawScore = 100 - (normalizedPenalty / maxPenalty) * 100;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let badge: ShowUpBadge;
  if (score >= 90) badge = 'PLATINUM';
  else if (score >= 75) badge = 'GOLD';
  else if (score >= 50) badge = 'SILVER';
  else if (score >= 25) badge = 'BRONZE';
  else badge = 'NONE';

  return { userId, totalCommitments, attendedCount, cancelledLate, noShowCount, score, badge };
}

export { LATE_CANCEL_HOURS };
