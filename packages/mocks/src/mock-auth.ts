/**
 * 認証フロー モック（ローカル開発用）
 *
 * USE_MOCKS=true の場合に使用するテストユーザー定義
 */

export const MOCK_USERS = [
  {
    id: 'mock-user-001',
    displayName: 'テストランナー A',
    email: 'runner-a@mock.kairos.app',
    lineUserId: 'mock-line-user-001',
    role: 'USER' as const,
  },
  {
    id: 'mock-user-002',
    displayName: 'テストコーチ B',
    email: 'coach-b@mock.kairos.app',
    lineUserId: 'mock-line-user-002',
    role: 'COACH' as const,
  },
] as const;

export type MockUser = (typeof MOCK_USERS)[number];

export function getMockUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getMockUserByLineId(lineUserId: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.lineUserId === lineUserId);
}
