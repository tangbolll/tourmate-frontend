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
      'react-native-worklets/plugin', //  <-- 이 줄을 추가하세요!
      //'react-native-reanimated/plugin', // Reanimated 플러그인은 항상 마지막에 두는 것이 좋습니다.
    ],
  };
};