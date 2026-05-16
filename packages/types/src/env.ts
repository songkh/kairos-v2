/**
 * 環境変数の型安全な読み込み
 *
 * 必須変数が未設定の場合は起動時に例外をスローする。
 * USE_MOCKS=true の場合は外部サービス変数を省略可能にする。
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません。.env.local.example を参照してください。`);
  }
  return value;
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined;
}

const USE_MOCKS = process.env['USE_MOCKS'] === 'true';

export const env = {
  nodeEnv: (process.env['NODE_ENV'] ?? 'development') as 'development' | 'production' | 'test',
  useMocks: USE_MOCKS,

  // Database
  databaseUrl: USE_MOCKS ? optional('DATABASE_URL') : required('DATABASE_URL'),
  directUrl: optional('DIRECT_URL'),

  // JWT
  jwtSecret: USE_MOCKS ? optional('JWT_SECRET') : required('JWT_SECRET'),
  jwtAccessTtlSec: Number(process.env['JWT_ACCESS_TTL_SEC'] ?? 900),
  jwtRefreshTtlSec: Number(process.env['JWT_REFRESH_TTL_SEC'] ?? 604800),

  // Redis
  upstashRedisUrl: optional('UPSTASH_REDIS_URL'),
  upstashRedisToken: optional('UPSTASH_REDIS_TOKEN'),

  // LINE
  lineChannelId: optional('LINE_CHANNEL_ID'),
  lineChannelSecret: optional('LINE_CHANNEL_SECRET'),
  lineLoginChannelId: optional('LINE_LOGIN_CHANNEL_ID'),
  lineLoginChannelSecret: optional('LINE_LOGIN_CHANNEL_SECRET'),

  // Mapbox
  mapboxAccessToken: optional('MAPBOX_ACCESS_TOKEN'),

  // Stripe
  stripeSecretKey: optional('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: optional('STRIPE_WEBHOOK_SECRET'),

  // Sentry
  sentryDsn: optional('SENTRY_DSN'),

  // PostHog
  posthogApiKey: optional('POSTHOG_API_KEY'),

  // Public URLs
  apiBaseUrl: process.env['API_BASE_URL'] ?? 'http://localhost:3001',
  webBaseUrl: process.env['WEB_BASE_URL'] ?? 'http://localhost:3000',
} as const;
