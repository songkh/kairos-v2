/**
 * アクティビティ関連の共有型定義
 */

export type ActivityType = 'RUN' | 'WALK' | 'TRAIL_RUN' | 'VIRTUAL_RUN';

export type ActivityPrivacy = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

export interface GpsPoint {
  lat: number;
  lng: number;
  /** GPS 精度（メートル） */
  accuracy: number;
  /** UNIX タイムスタンプ（ミリ秒） */
  timestamp: number;
  /** 標高（メートル、オプション） */
  altitude?: number;
  /** 心拍数（オプション） */
  heartRate?: number;
}

export interface ActivitySummary {
  id: string;
  userId: string;
  type: ActivityType;
  privacy: ActivityPrivacy;
  /** 距離（メートル） */
  distanceM: number;
  /** 所要時間（秒） */
  durationSec: number;
  /** 平均ペース（秒/km） */
  avgPaceSec: number;
  /** 獲得標高（メートル） */
  elevationGainM?: number;
  /** 平均心拍数 */
  avgHeartRate?: number;
  /** 最大心拍数 */
  maxHeartRate?: number;
  startedAt: Date;
  finishedAt: Date;
  createdAt: Date;
}

export interface CreateActivityInput {
  type: ActivityType;
  privacy: ActivityPrivacy;
  distanceM: number;
  durationSec: number;
  /** GPS トラック（速度検証済み後のポイント列） */
  gpsTrack?: GpsPoint[];
  startedAt: Date;
  finishedAt: Date;
  /** 手動入力フラグ（GPS なし） */
  isManual?: boolean;
  title?: string;
  description?: string;
}
