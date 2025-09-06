const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 문제의 원인이 되는 네이티브 컴포ー넌트를 웹에서 무시하도록 설정합니다.
  config.resolve.alias['react-native-maps/lib/MapMarkerNativeComponent'] =
    path.join(__dirname, 'empty-module.js'); // 아래 3단계에서 만들 파일
  config.resolve.alias['react-native-maps/lib/MapCalloutNativeComponent'] =
    path.join(__dirname, 'empty-module.js'); // 다른 잠재적 문제 파일도 추가

  return config;
};