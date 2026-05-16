// Expo Go stub for @sentry/react-native
// @sentry/react-native は Expo Go 非対応のため EAS Build でのみ使用可能
// このスタブは expo-go-preview ブランチでの開発確認用

const Sentry = {
  init: function() {},
  captureException: function(err) { console.warn('[Sentry stub] captureException:', err?.message); },
  captureMessage: function(msg) { console.warn('[Sentry stub] captureMessage:', msg); },
  setUser: function() {},
  setTag: function() {},
  setExtra: function() {},
  addBreadcrumb: function() {},
  withScope: function(callback) { callback({ setTag: function() {}, setExtra: function() {} }); },
  wrap: function(component) { return component; },
};

module.exports = Sentry;
module.exports.default = Sentry;
