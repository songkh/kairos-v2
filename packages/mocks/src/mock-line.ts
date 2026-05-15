/**
 * LINE Login モック（ローカル開発用）
 *
 * USE_MOCKS=true の場合、LINE OAuth フローをスキップして
 * ダミーのユーザー情報を返す。
 */

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface MockLineClient {
  verifyIdToken(idToken: string): Promise<LineUserProfile>;
  getUserProfile(accessToken: string): Promise<LineUserProfile>;
}

/** ローカル開発用 LINE モック */
export const mockLineClient: MockLineClient = {
  async verifyIdToken(_idToken: string): Promise<LineUserProfile> {
    // USE_MOCKS=true の場合はトークン検証をスキップして固定プロフィールを返す
    return {
      userId: 'mock-line-user-001',
      displayName: 'テストランナー',
      pictureUrl: 'https://via.placeholder.com/150',
    };
  },

  async getUserProfile(_accessToken: string): Promise<LineUserProfile> {
    return {
      userId: 'mock-line-user-001',
      displayName: 'テストランナー',
      pictureUrl: 'https://via.placeholder.com/150',
    };
  },
};

/**
 * USE_MOCKS 設定に応じて LINE クライアントを返す
 */
export function createLineClient(useMocks: boolean): MockLineClient {
  if (useMocks) {
    return mockLineClient;
  }
  // 本番実装は packages/integrations で実装
  throw new Error(
    'LINE クライアントの本番実装は packages/integrations を使用してください。',
  );
}
