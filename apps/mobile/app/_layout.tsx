import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

// 起動時クラッシュを画面に表示するエラーバウンダリ
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView>
            <Text style={styles.errorTitle}>クラッシュしました</Text>
            <Text style={styles.errorMessage}>{this.state.error.message}</Text>
            <Text style={styles.errorStack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a0000',
    padding: 20,
    paddingTop: 60,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#ffaaaa',
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  errorStack: {
    color: '#ffdddd',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
