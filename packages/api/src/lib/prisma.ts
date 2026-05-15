/**
 * Prisma クライアントシングルトン
 *
 * セキュリティルール（.claude/rules/security.md §6）:
 *   DATABASE_URL は pooler URL (port 6543) + pgbouncer=true&connection_limit=1 必須
 *   DIRECT_URL はマイグレーション実行時のみ使用（port 5432）
 *
 * USE_MOCKS=true: インメモリ MockPrismaClient を使用（Supabase 不要）
 */

import { MockPrismaClient } from '@kairos/mocks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrisma = any;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: AnyPrisma | undefined;
}

function createPrisma(): AnyPrisma {
  const useMocks = process.env['USE_MOCKS'] === 'true';
  const hasDatabaseUrl = Boolean(process.env['DATABASE_URL']);

  if (useMocks || !hasDatabaseUrl) {
    return new MockPrismaClient();
  }

  // 動的インポート: USE_MOCKS=false かつ DATABASE_URL が設定済みの場合のみ
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma: AnyPrisma = global.__prisma ?? createPrisma();

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
}
