/**
 * packages/mocks — USE_MOCKS=true 対応モック実装
 *
 * このパッケージは LINE / Garmin / PayPay / Stripe などの外部サービスなしで
 * ローカル開発を可能にするモック実装を提供する。
 *
 * 使い方: .env.local で USE_MOCKS=true を設定する
 */

export * from './mock-line.js';
export * from './mock-redis.js';
export * from './mock-auth.js';
export * from './mock-prisma.js';
