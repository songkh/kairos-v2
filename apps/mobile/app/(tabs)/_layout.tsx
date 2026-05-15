/**
 * ボトムタブナビゲーション
 *
 * タブ構成（kairos-sketch.md §3 より）:
 *   [ ホーム ] [ 探す ] [ [RUN] ] [ チーム ] [ プロフィール ]
 *
 * ダークモード: Sprint 1 から必須（早朝・夜間ランナー対応）
 */

import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

function RunTabIcon() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.runButton, { backgroundColor: colors.primary }]}>
      {/* TODO(kairos-mobile): RUN アイコン SVG を追加 */}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: () => null, // TODO(kairos-mobile): アイコン追加
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '探す',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: 'RUN',
          tabBarIcon: () => <RunTabIcon />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'チーム',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  runButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
