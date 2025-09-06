const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 모바일/웹에서 Node 전용 라이브러리를 무력화
config.resolver.extraNodeModules = {
  jimp: path.resolve(__dirname, "emptyModule.js"),
  "jimp-compact": path.resolve(__dirname, "emptyModule.js")
};

config.resolver.platforms = ["ios", "android", "web"];

module.exports = config;
