/**
 * Sentry 設定（APPI 準拠）
 *
 * セキュリティルール（.claude/rules/security.md §5）:
 *   - beforeBreadcrumb で GPS 座標・決済情報を除去
 *   - beforeSend でリクエストボディから GPS・決済情報を除去
 *   - GPS 座標が Sentry に送信されないことは kairos-qa が確認する
 *
 * app.ts から最初に import すること（他の import より前）
 */

import * as Sentry from '@sentry/node';

const SENSITIVE_GPS_KEYS = [
  'latitude',
  'longitude',
  'lat',
  'lng',
  'location',
  'gpsTrack',
  'gpsTrace',
  'homeLatitude',
  'homeLongitude',
] as const;

const SENSITIVE_PAYMENT_KEYS = [
  'cardNumber',
  'paymentMethod',
  'paymentToken',
  'cvv',
  'creditCard',
] as const;

function removeSensitiveKeys(data: Record<string, unknown>): void {
  // APPI: GPS 座標・決済情報を除去
  for (const key of [...SENSITIVE_GPS_KEYS, ...SENSITIVE_PAYMENT_KEYS]) {
    delete data[key];
  }
}

export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    if (process.env['NODE_ENV'] === 'production') {
      console.warn('SENTRY_DSN が設定されていません。本番環境では設定してください。');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,

    // APPI: GPS 座標・決済情報を Sentry に送信しない
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        removeSensitiveKeys(breadcrumb.data as Record<string, unknown>);
      }
      return breadcrumb;
    },

    beforeSend(event) {
      // リクエストボディから GPS・決済情報を除去
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        removeSensitiveKeys(data);
      }

      // extra から GPS・決済情報を除去
      if (event.extra) {
        removeSensitiveKeys(event.extra as Record<string, unknown>);
      }

      return event;
    },
  });
}
