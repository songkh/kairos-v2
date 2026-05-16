/**
 * ユーザー関連の共有型定義
 */
import type { PaceBand } from './pace.js';
export type UserRole = 'USER' | 'COACH' | 'ADMIN';
export interface UserProfile {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    role: UserRole;
    /** 自宅座標（500m ぼかし処理のため — API レスポンスには絶対に含めない） */
    /** Pace Passport の現在のバンド */
    paceBand?: PaceBand | null;
    createdAt: Date;
}
/**
 * API レスポンスで返すパブリックプロフィール
 * （自宅座標・メールアドレスは含まない）
 */
export type PublicUserProfile = Omit<UserProfile, 'homeLatitude' | 'homeLongitude'>;
export interface UpdateProfileInput {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
}
//# sourceMappingURL=user.d.ts.map