import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { jest,describe, beforeEach, expect, it } from '@jest/globals';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

type LoginProps = NativeStackScreenProps<RootStackParamList, "Login">;

const mockSignInWithGoogle = jest.fn<() => Promise<{ user: { uid: string } }>>().mockResolvedValue({ user: { uid: 'test' } });
const mockInitializeAuthObserver = jest.fn();
const mockSignOut = jest.fn();
const mockSetUser = jest.fn();
const mockSetInitializing = jest.fn();

jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: 'MaterialIcons',
}));

jest.mock('../src/services/authService', () => ({
    __esModule: true,
    signInWithGoogle: mockSignInWithGoogle,
    initializeAuthObserver: mockInitializeAuthObserver,
    signOut: mockSignOut,
    default: {
        signInWithGoogle: mockSignInWithGoogle,
        initializeAuthObserver: mockInitializeAuthObserver,
        signOut: mockSignOut,
    },
}));

type AuthState = {
  user: FirebaseAuthTypes.User | null;
  isInitializing: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setInitializing: (isInitializing: boolean) => void;
};

jest.mock('../src/store/authStore', () => ({
    useAuthStore: (selector: (state: AuthState) => unknown) => selector({
        user: null,
        isInitializing: false,
        setUser: mockSetUser,
        setInitializing: mockSetInitializing,
    }),
}));

jest.mock(`@react-native-firebase/app`, () => ({
    default: jest.fn(),
}));

jest.mock(`@react-native-firebase/crashlytics`, () => {
    return () => ({
        log: jest.fn(),
        recordError: jest.fn(),
        crash: jest.fn(),
        setAttribute: jest.fn(),
        setUserId: jest.fn(),
    });
});

jest.mock(`@react-native-firebase/auth`, () => ({
    default: jest.fn(() => ({
        signInWithCredential: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChanged: jest.fn(),
    })),
}));

jest.mock(`@react-native-firebase/firestore`, () => ({
    default: jest.fn(() => ({
        collection: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        setDoc: jest.fn(),
    })),
}));

jest.mock(`@react-native-google-signin/google-signin`, () => ({
    GoogleSignin: {
        configure: jest.fn(),
        signIn: jest.fn(),
        hasPlayServices: jest.fn(),
        signOut: jest.fn(),
    },
}));

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderWithProviders = (component: React.ReactElement) => {
    return render(<NativeBaseProvider initialWindowMetrics={inset}>{component}
    </NativeBaseProvider>);
};

jest.mock('native-base', () => {
    const React = require('react');
    const { View, Text, Pressable } = require('react-native');

    const wrap =
        (Comp = View) =>
        function WrappedComponent({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
            return <Comp {...props}>{children}</Comp>;
        };

    return {
        NativeBaseProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useToast: () => ({ show: jest.fn() }),
        Button: ({ onPress, children, testID, accessibilityLabel }: { onPress: () => void; children: React.ReactNode; testID?: string; accessibilityLabel?: string }) => (
            <Pressable onPress={onPress} testID={testID} accessibilityLabel={accessibilityLabel}>
                <Text>{children}</Text>
            </Pressable>
        ),
        Center: wrap(View),
        VStack: wrap(View),
        HStack: wrap(View),
        Box: wrap(View),
        Stack: wrap(View),
        Heading: wrap(Text),
        Icon: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Text,
    };
});

// ここで初めてコンポーネントを読み込む（モック適用後）
const LoginScreen = require('./login').default;

describe('LoginScreen', () => {
    const mockNavigation: Partial<LoginProps[`navigation`]> = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        replace: jest.fn(),
    };

    const mockRoute: Partial<LoginProps[`route`]> = {
        params: undefined,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSetUser.mockClear();
        mockSetInitializing.mockClear();
        // モックの戻り値を毎回セットし直す
        mockSignInWithGoogle.mockResolvedValue({ user: { uid: 'test' } } as { user: { uid: string } });
    });

    it('画面が正しく表示されること', async () => {
        const { getAllByText, getByTestId } = renderWithProviders(
            <LoginScreen navigation={mockNavigation as LoginProps[`navigation`]} route={mockRoute as LoginProps[`route`]} />
        );
        expect(getAllByText('ログイン')).toHaveLength(1);
        expect(getByTestId('googleLoginButton')).toBeTruthy();
    });

    it('Googleログインボタンを押すとsignInWithGoogleが呼ばれること', async () => {
        const { getByLabelText } = renderWithProviders(
            <LoginScreen navigation={mockNavigation as LoginProps[`navigation`]} route={mockRoute as LoginProps[`route`]} />
        );
        const googleLoginButton = getByLabelText('Googleでログイン');

        await act(async () => {
            fireEvent.press(googleLoginButton);
        });
        
        // signInWithGoogleが呼ばれるまで待つ
        await waitFor(() => {
            expect(mockSignInWithGoogle).toHaveBeenCalled();
        }, { timeout: 3000 });

        // ログイン成功したらMainに遷移するはず
        expect(mockNavigation.replace).toHaveBeenCalledWith('Main');
    });
});