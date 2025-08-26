module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            "babel-preset-expo", // Expo의 기본 preset
            "nativewind/babel",  // NativeWind 설정을 presets에 추가
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
        ],
    };
};