const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 웹에서 Jimp / jimp-compact를 빈 모듈로 대체
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'jimp' || moduleName === 'jimp-compact')) {
    return context.resolveRequest(
      context,
      path.resolve(__dirname, './emptyModule.js'),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
