module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel",
    ],
    plugins: [
      // ❌ 'react-native-reanimated/plugin'이 여기에 있으면 안 됩니다.
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // ✅ 반드시 가장 마지막 줄에 위치해야 합니다.
      'react-native-reanimated/plugin', 
    ],
  };
};