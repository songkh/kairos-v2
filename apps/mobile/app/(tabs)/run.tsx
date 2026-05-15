/**
 * RUN タブ（GPS 記録画面）
 *
 * 機能:
 *   - GPS 記録開始・停止
 *   - リアルタイム指標表示（ペース・距離・時間）
 *   - Mapbox ルートマップ表示（@rnmapbox/maps — Expo Go 非対応のため eas build 必須）
 *   - ラップ機能（1km 自動 + 手動）
 *
 * セキュリティ:
 *   - GPS 座標を console.log に出力しない（APPI）
 *   - GPS 速度検証は packages/geo で実施
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import type { GpsPoint } from '@kairos/types';

type RunState = 'idle' | 'running' | 'paused' | 'finished';

export default function RunScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [runState, setRunState] = useState<RunState>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [currentPaceSec, setCurrentPaceSec] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // GPS 座標は console.log に出力しない（APPI）
  const gpsTrackRef = useRef<GpsPoint[]>([]);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const formatTime = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatPace = (paceSec: number): string => {
    if (paceSec === 0) return '--:--';
    const min = Math.floor(paceSec / 60);
    const sec = Math.round(paceSec % 60);
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const formatDistance = (m: number): string => {
    if (m < 1000) return `${m.toFixed(0)}m`;
    return `${(m / 1000).toFixed(2)}km`;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      Alert.alert(
        '位置情報が必要です',
        'GPS 記録には位置情報の許可が必要です。設定から許可してください。',
      );
      return false;
    }

    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    if (background !== 'granted') {
      Alert.alert(
        'バックグラウンド位置情報',
        'バックグラウンドでのランニング記録には「常に許可」が必要です。',
      );
      // フォアグラウンドのみでも記録は可能
    }

    return true;
  };

  const startRun = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    gpsTrackRef.current = [];
    setElapsedSec(0);
    setDistanceM(0);
    setCurrentPaceSec(0);
    setRunState('running');

    // タイマー開始
    timerRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    // GPS 記録開始（バックグラウンド対応）
    // GPS 座標を console.log に出力しない（APPI）
    locationSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,       // 3 秒間隔
        distanceInterval: 5,      // 最小 5m 移動で更新
      },
      (locationUpdate) => {
        const point: GpsPoint = {
          lat: locationUpdate.coords.latitude,
          lng: locationUpdate.coords.longitude,
          accuracy: locationUpdate.coords.accuracy ?? 100,
          timestamp: locationUpdate.timestamp,
          altitude: locationUpdate.coords.altitude ?? undefined,
        };
        // APPI: GPS 座標を console.log に出力しない
        gpsTrackRef.current.push(point);

        // 距離更新
        if (gpsTrackRef.current.length >= 2) {
          const prev = gpsTrackRef.current[gpsTrackRef.current.length - 2];
          if (prev) {
            // TODO(kairos-mobile): @kairos/geo の calculateDistance を使う
            setDistanceM((d) => d + 10); // 仮実装
          }
        }
      },
    );
  };

  const stopRun = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    locationSubscriptionRef.current?.remove();
    setRunState('finished');
    // TODO(kairos-mobile): ラン完了サマリー画面に遷移
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      locationSubscriptionRef.current?.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.metricsContainer}>
        {/* 距離 */}
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatDistance(distanceM)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>距離</Text>
        </View>

        {/* 時間 */}
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatTime(elapsedSec)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>時間</Text>
        </View>

        {/* ペース */}
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatPace(currentPaceSec)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>ペース/km</Text>
        </View>
      </View>

      {/* TODO(kairos-mobile): Mapbox ルートマップ（@rnmapbox/maps — eas build 必須） */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
        <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
          マップ（@rnmapbox/maps — eas build 必須）
        </Text>
      </View>

      {/* 記録ボタン */}
      {runState === 'idle' && (
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: colors.primary }]}
          onPress={startRun}
          accessibilityLabel="ランニング記録を開始"
          accessibilityRole="button"
        >
          <Text style={styles.recordButtonText}>RUN 開始</Text>
        </TouchableOpacity>
      )}

      {runState === 'running' && (
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: colors.error }]}
          onPress={stopRun}
          accessibilityLabel="ランニング記録を終了"
          accessibilityRole="button"
        >
          <Text style={styles.recordButtonText}>終了</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapPlaceholderText: {
    fontSize: 14,
  },
  recordButton: {
    borderRadius: 40,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
