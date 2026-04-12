// Reanimated のモック設定
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// @testing-library/jest
require('@testing-library/jest-native/extend-expect');