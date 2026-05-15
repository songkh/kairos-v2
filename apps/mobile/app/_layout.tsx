/**
 * ルートレイアウト
 * Sentry + ダークモード基盤の初期化
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as Sentry from '@sentry/react-native';

// APPI: beforeBreadcrumb / beforeSend で GPS 座標・決済情報を除去
Sentry.init({
  dsn: process.env['EXPO_PUBLIC_SENTRY_DSN'],
  environment: process.env['NODE_ENV'] ?? 'development',

  // APPI: GPS 座標・決済情報を Sentry に送信しない
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.data) {
      const sensitiveKeys = [
        'latitude', 'longitude', 'lat', 'lng', 'location',
        'gpsTrack', 'cardNumber', 'paymentMethod',
      ];
      for (const key of sensitiveKeys) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (breadcrumb.data as Record<string, unknown>)[key];
      }
    }
    return breadcrumb;
  },

  beforeSend(event) {
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      const sensitiveKeys = ['latitude', 'longitude', 'gpsTrack', 'cardNumber', 'paymentToken'];
      for (const key of sensitiveKeys) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete data[key];
      }
    }
    return event;
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
    </>
  );
}
