/**
 * ホームタブ
 *
 * 表示内容:
 *   - 週次進捗リング（距離・ストリーク）
 *   - 次のイベント（最大 2 件）
 *   - チームアクティビティフィード（最新 3 件）
 *   - AIコーチングナッジカード（Sprint 5 以降）
 */

import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.text }]}>Kairos</Text>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          今週の進捗を確認しましょう
        </Text>
        {/* TODO(kairos-mobile): 週次進捗リングコンポーネント */}
        {/* TODO(kairos-mobile): 次のイベントセクション（Sprint 4）*/}
        {/* TODO(kairos-mobile): チームアクティビティフィード（Sprint 3）*/}
        {/* TODO(kairos-mobile): AIコーチングカード（Sprint 5）*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 15,
    marginBottom: 24,
  },
});
