import React from 'react';
import { render, fireEvent, waitFor} from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import LoginScreen from './login'; // テスト対象のコンポーネントをインポート
import {signInWithGoogle } from '../src/services/authService';
import { describe, beforeEach, expect, it } from '@jest/globals';

jest.mock('../src/services/authService', () => ({
    signInWithGoogle: jest.fn(),
}));

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderWithProviders = (component: React.ReactElement) => {
    return render(<NativeBaseProvider initialWindowMetrics={inset}>{component}
    </NativeBaseProvider>);
};

describe('LoginScreen', () => {
    const mockNavigation: any = {
        navigate: jest.fn(),
        goBack: jest.fn(),
    };

    const mockRoute: any = {
        params: {},
    };

    it('画面が正しく表示されること', () => {
        const { getByPlaceholderText, getAllByText, getByText } = renderWithProviders(
            <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByPlaceholderText('メールアドレスを入力')).toBeTruthy();
        expect(getByPlaceholderText('パスワードを入力')).toBeTruthy();
        expect(getAllByText('ログイン')).toHaveLength(2); // ボタンと見出し
        expect(getByText('Googleでログイン')).toBeTruthy();
    });

    it('Googleログインボタンを押すとsignInWithGoogleが呼ばれること', async () => {
        const { getByText } = renderWithProviders(
            <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
        
        const googleLoginButton = getByText('Googleでログイン');
        await expect(googleLoginButton).toBeVisible();

        await googleLoginButton.tap();

        await waitFor(() => {
            expect(signInWithGoogle).toHaveBeenCalled();
        });
    });
});