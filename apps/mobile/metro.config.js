const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// モノレポ内の packages/* を解決できるようにする
// Expo SDK 52 では getDefaultConfig が pnpm-workspace.yaml を自動検出するが、
// Windows 環境でのシンボリックリンク解決のため明示的に設定する
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm のシンボリックリンクを追跡できるようにする
config.resolver.unstable_enableSymlinks = true;

// Expo Go 非対応のネイティブモジュールをスタブに差し替え
// EAS Build 時はこのブランチを使わないため、このスタブはプレビュー専用
//
// Metro の resolveRequest コールバック仕様:
//   - Metro は context.resolveRequest をデフォルトの resolve 関数に差し替えた
//     新しい context を渡してカスタム resolveRequest を呼ぶ
//   - そのため context.resolveRequest(context, ...) を呼んでも無限ループにならない
//   - カスタム関数は必ず解決結果を返すか throw すること（undefined 禁止）
const expoGoStubs = {
  '@rnmapbox/maps': path.resolve(projectRoot, 'expo-go-stubs/rnmapbox-maps.js'),
  '@sentry/react-native': path.resolve(projectRoot, 'expo-go-stubs/sentry.js'),
  '@stripe/stripe-react-native': path.resolve(projectRoot, 'expo-go-stubs/stripe.js'),
  'react-native-health': path.resolve(projectRoot, 'expo-go-stubs/react-native-health.js'),
};

const webStubs = {
  'react-native-reanimated': path.resolve(projectRoot, 'web-stubs/react-native-reanimated.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Web 向けスタブ
  if (platform === 'web' && webStubs[moduleName]) {
    return { filePath: webStubs[moduleName], type: 'sourceFile' };
  }

  // Expo Go (iOS/Android) 向けスタブ
  if (platform !== 'web' && expoGoStubs[moduleName]) {
    return { filePath: expoGoStubs[moduleName], type: 'sourceFile' };
  }

  // デフォルトの解決処理に委譲
  // Metro は context.resolveRequest をデフォルトの resolve 関数に置き換えて渡すので
  // ここで呼んでも無限ループにはならない
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
