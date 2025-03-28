module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            "babel-preset-expo", // Expo의 기본 preset
            "nativewind/babel",  // NativeWind 설정을 presets에 추가
        ],
        plugins: [
            // 여기에 필요한 다른 플러그인들을 추가할 수 있습니다
        ],
    };
};