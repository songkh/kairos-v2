const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// モノレポ内の packages/* を解決できるようにする
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Web ではネイティブ専用モジュールをスタブに差し替え
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const stubs = {
      'react-native-reanimated': path.resolve(projectRoot, 'web-stubs/react-native-reanimated.js'),
    };
    if (stubs[moduleName]) {
      return { filePath: stubs[moduleName], type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
