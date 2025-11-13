import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider, useColorMode } from "native-base";
import { initializeAuthObserver } from "../src/services/authService";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../src/store/authStore";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { createNavigationContainerRef } from '@react-navigation/native';
import { extendTheme } from "native-base";

import IndexScreen from "./index";
import LoginScreen from "./login";
import { RootStackParamList } from "./navigation/types";
import RegisterScreen from "./register";
import BottomTabNavigator from "./tab/bottomtabnavigator"; // BottomTabNavigatorをインポート
import RoomScreen from "./room";

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ダークモード状態を管理するコンテキスト作成
import { createContext } from "react";
import { color } from "native-base/lib/typescript/theme/styled-system";
import { ColorModeContext } from "./hooks/ColorModeContext ";

const ColorModeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const value = React.useMemo(
    () => ({ colorMode, toggleColorMode }),
    [colorMode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={value as any}>
      {children}
    </ColorModeContext.Provider>
  );
};

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  colors: {
    primary: {
      600: '#3B82F6',
      700: '#1D4ED8',
    },
    success: {
      500: '#10B981',
    },
    danger: {
      500: '#EF4444',
    },
    warning: {
      500: '#F59E0B',
    },
    gray: {
      100: '#F3F4F6',
      300: '#D1D5DB',
      400: '#9CA3AF',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    blue: {
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
    },
  },
  components: {
    Heading: {
      baseStyle: (props: any) => {
        return {
          _light: { color: 'gray.900' },
          _dark: { color: 'gray.100' },
        };
      },
    },
    Text: {
      baseStyle: (props: any) => {
        return {
          bg: 'transparent',               // ← 追加：常に背景は透明
          _light: { color: 'gray.900' },
          _dark: { color: 'gray.100' },
        };
      },
    },
    Input: {
      baseStyle: (props: any) => {
        return {
          _light: { 
            bg: 'white', 
            borderColor: 'gray.300', 
            color: 'gray.900',
            placeholderTextColor: 'gray.400',
            _focus: { borderColor: 'blue.500' },
          },
          _dark: { 
            bg: 'gray.700', 
            borderColor: 'gray.600', 
            color: 'gray.100',
            placeholderTextColor: 'gray.400',
            _focus: { borderColor: 'blue.400' },
          },
        };
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'md',
      },
      defaultProps: {
        variant: 'solid',
        colorScheme: 'blue',
        size: 'md',
      },
      sizes: {
        md: {
          px: 4,
          py: 3,
        },
      },
      variants: {
        solid: {
          _light: {
            bg: 'blue.600',
            _text: {
              color: 'white',
              fontWeight: 'semibold',
            },
            _pressed: {
              bg: 'blue.700',
            },
            _disabled: {
              bg: 'gray.300',
              _text: { color: 'gray.500' },
            },
          },
          _dark: {
            bg: 'blue.600',
            _text: {
              color: 'white',
              fontWeight: 'semibold',
            },
            _pressed: {
              bg: 'blue.700',
            },
            _disabled: {
              bg: 'gray.700',
              _text: { color: 'gray.500' },
            },
          },
        },
        outline: {
          _light: {
            bg: 'transparent',
            borderWidth: 1,
            borderColor: 'gray.400',
            _text: { color: 'gray.800', fontWeight: 'semibold' },
            _pressed: {
              bg: 'gray.100',
              borderColor: 'gray.500',
            },
          },
          _dark: {
            bg: 'transparent',
            borderWidth: 1,
            borderColor: 'gray.500',
            _text: { color: 'gray.100', fontWeight: 'semibold' },
            _pressed: {
              bg: 'gray.700',
              borderColor: 'gray.400',
            },
          },
        },
        ghost: {
          _light: { 
            bg: 'transparent', 
            _text: { color: 'gray.700', bg: 'transparent' }, 
            _pressed: { 
              bg: 'gray.100',
              _text: { bg: 'transparent' },
            } 
          },
          _dark: { 
            bg: 'transparent', 
            _text: { color: 'gray.300', bg: 'transparent' }, 
            _pressed: { 
              bg: 'gray.700',
              _text: { bg: 'transparent' },
            } 
          },
        },
      },
    },
    TextArea: {
      baseStyle: (props: any) => {
        return {
          _light: { 
            bg: 'white', 
            borderColor: 'gray.300', 
            color: 'gray.900',
            placeholderTextColor: 'gray.400',
            _focus: { borderColor: 'blue.500' },
          },
          _dark: { 
            bg: 'gray.700', 
            borderColor: 'gray.600', 
            color: 'gray.100',
            placeholderTextColor: 'gray.400',
            _focus: { borderColor: 'blue.400' },
          },
        };
      },
    },
  },
});

export default function RootLayout() {
  const { user, isInitializing } = useAuthStore();
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = initializeAuthObserver();
    return unsubscribe;
  }, []);

  // ユーザー状態の変更を監視して画面を切り替え
  useEffect(() => {
    if (navigationRef.isReady() && user) {
      navigationRef.navigate("Main");
    } else if (navigationRef.isReady() && !user && !isInitializing) {
      navigationRef.navigate("Index");
    }
  }, [user, isInitializing]);

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 認証状態が初期化中の場合はローディング画面を表示
  if (isInitializing) {
    return (
      <NativeBaseProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </NativeBaseProvider>
    );
  }

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      <NativeBaseProvider theme={theme} >
        <ColorModeBridge>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
              initialRouteName={user ? "Main" : "Index"}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Index" component={IndexScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Main" component={BottomTabNavigator} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Room" component={RoomScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ColorModeBridge>
      </NativeBaseProvider>
    </ColorModeContext.Provider>
  );
}
