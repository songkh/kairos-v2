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

// react-native-reanimated の Web 対応
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native-reanimated' &&
    platform === 'web'
  ) {
    return context.resolveRequest(
      context,
      'react-native-reanimated/src/index.ts',
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
