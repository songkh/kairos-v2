// Web stub for react-native-reanimated
// expo-routerがreact-native-reanimatedを内部で使うため、createAnimatedComponentが必要
const { View, Text, ScrollView, FlatList, Image } = require('react-native');

function createAnimatedComponent(Component) {
  return Component;
}

const Reanimated = {
  createAnimatedComponent,
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: () => ({}),
  useAnimatedProps: () => ({}),
  useAnimatedScrollHandler: () => ({}),
  useAnimatedGestureHandler: () => ({}),
  useAnimatedRef: () => ({ current: null }),
  useDerivedValue: (fn) => ({ value: fn() }),
  withTiming: (v) => v,
  withSpring: (v) => v,
  withRepeat: (v) => v,
  withSequence: (...args) => args[0],
  withDelay: (_delay, v) => v,
  cancelAnimation: () => {},
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  measure: () => {},
  scrollTo: () => {},
  interpolate: (_v, _i, output) => output[0],
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    bezier: () => (t) => t,
    in: (fn) => fn,
    out: (fn) => fn,
    inOut: (fn) => fn,
  },
  // Animated コンポーネント
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
};

Reanimated.default = Reanimated;
module.exports = Reanimated;
