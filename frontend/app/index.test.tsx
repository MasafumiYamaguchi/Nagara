import React from 'react';
import { render } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import Index from './index'; // テスト対象のコンポーネントをインポート
import { describe, beforeEach, expect, it } from '@jest/globals';

// NativeBaseとexpo-routerのモックが必要な場合があるため、
// jest-setup.jsで設定したモックが使われます。

describe('<Index />', () => {
  it('renders correctly', () => {
    // React Navigationから渡されるpropsのモックを作成します
    const mockNavigation = {
      navigate: jest.fn(),
      // 必要に応じて他のnavigationメソッドをモックします
    };
    const mockRoute = {
      key: 'mockRouteKey',
      name: 'Index',
      params: {},
    };

    // NativeBaseProviderでラップするための設定
    const inset = {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    };

    const { getByText } = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <Index navigation={mockNavigation as any} route={mockRoute as any} />
      </NativeBaseProvider>
    );
    
    // コンポーネント内に表示されるべきテキストを探します。
    // 例として 'ログイン' というテキストを探す場合：
    expect(getByText('ログイン')).toBeTruthy();
    expect(getByText('ホームへ')).toBeTruthy();
  });
});