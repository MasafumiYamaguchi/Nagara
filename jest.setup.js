// 必要なモックだけを残して、問題のあるインポートをコメントアウト
// import 'react-native-gesture-handler/jestSetup';
// import '@testing-library/jest-native/extend-expect';

// Reanimated のモック設定
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// 問題のあるモックをコメントアウト
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => {});

