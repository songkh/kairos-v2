module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated/plugin は babel-preset-expo が自動で追加するため不要
    // 手動追加すると二重登録になりバンドルエラーの原因になる
    plugins: [],
  };
};
