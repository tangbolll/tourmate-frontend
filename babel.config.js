module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel",
    ],
    plugins: [
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