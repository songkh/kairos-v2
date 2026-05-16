// Web stub for react-native-reanimated (not used in current screens)
module.exports = {
  default: {},
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => ({}),
  withTiming: (v) => v,
  withSpring: (v) => v,
  Animated: { View: require('react-native').View, Text: require('react-native').Text },
};
