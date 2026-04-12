const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// NativeBaseの依存関係解決のための設定
config.resolver.assetExts.push('svg');
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// e2eモード時は .e2e.ts を優先
if (process.env.DETOX_E2E === 'true') {
  config.resolver.sourceExts = ['e2e.ts', 'e2e.tsx', 'e2e.js', 'e2e.jsx', ...config.resolver.sourceExts];
}

module.exports = config;
