/**
 * プロフィールタブ
 * TODO(kairos-mobile): Sprint 2 で完全実装
 */

import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>プロフィール</Text>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          Pace Passport・統計・設定（Sprint 2 で実装予定）
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  heading: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtext: { fontSize: 15 },
});
