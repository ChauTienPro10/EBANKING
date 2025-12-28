const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
    resolver: {
        sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx'],
        alias: {
            'crypto': 'react-native-quick-crypto',
            'stream': 'readable-stream',
            'buffer': '@craftzdog/react-native-buffer',
        },
    },
};

module.exports = mergeConfig(defaultConfig, config);
