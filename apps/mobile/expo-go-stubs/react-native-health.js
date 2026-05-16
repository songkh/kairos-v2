// Expo Go stub for react-native-health
// react-native-health は Expo Go 非対応のため EAS Build (iOS) でのみ使用可能
// このスタブは expo-go-preview ブランチでの開発確認用

const AppleHealthKit = {
  initHealthKit: function(perms, callback) { callback(null, true); },
  isAvailable: function(callback) { callback(null, false); },
  getStepCount: function(opts, callback) { callback(null, { value: 0 }); },
  getDistanceWalkingRunning: function(opts, callback) { callback(null, { value: 0 }); },
  saveWorkout: function(opts, callback) { callback(null, true); },
  Constants: { Permissions: {} },
};

module.exports = AppleHealthKit;
module.exports.default = AppleHealthKit;
