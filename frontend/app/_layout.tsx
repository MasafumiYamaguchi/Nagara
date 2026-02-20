import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider, useColorMode } from "native-base";
import { initializeAuthObserver } from "../src/services/authService";
import React, { useEffect } from "react";
import { useAuthStore } from "../src/store/authStore";
import { ActivityIndicator, View } from "react-native";
import { createNavigationContainerRef } from '@react-navigation/native';
import { extendTheme } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IndexScreen from "./index";
import LoginScreen from "./login";
import ToSScreen from "./tos";
import { RootStackParamList } from "./navigation/types";
import RegisterScreen from "./register";
import BottomTabNavigator from "./tab/bottomtabnavigator"; // BottomTabNavigatorをインポート
import RoomScreen from "./room";
import PrivacyScreen from "./privacy";
import HelpAndSupport from "./helpandsupport";
import Support from "./support"; // Support画面をインポート

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ダークモード状態を管理するコンテキスト作成
import { ColorModeContext } from "./hooks/ColorModeContext ";

const ColorModeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    const run = async () => {
      const stored = await AsyncStorage.getItem("colorMode");
      if (stored === "dark") setColorMode("dark");
      if (stored === "light") setColorMode("light");
    };
    run();
  }, [setColorMode]);

  const setColorModeWithPersist = React.useCallback(
    (mode: "light" | "dark") => {
      setColorMode(mode);
      AsyncStorage.setItem("colorMode", mode);
    },
    [setColorMode],
  );

  const toggleColorMode = React.useCallback(() => {
    const next = colorMode === "light" ? "dark" : "light";
    setColorModeWithPersist(next);
  }, [colorMode, setColorModeWithPersist]);

  const value = React.useMemo(
    () => ({
      colorMode: colorMode as "light" | "dark",
      toggleColorMode,
      setColorMode: setColorModeWithPersist,
    }),
    [colorMode, toggleColorMode, setColorModeWithPersist],
  );

  return (
    <ColorModeContext.Provider value={value}>
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
      baseStyle: () => {
        return {
          _light: { color: 'gray.900' },
          _dark: { color: 'gray.100' },
        };
      },
    },
    Text: {
      baseStyle: () => {
        return {
          bg: 'transparent',               // ← 追加：常に背景は透明
          _light: { color: 'gray.900' },
          _dark: { color: 'gray.100' },
        };
      },
    },
    Input: {
      baseStyle: () => {
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
      baseStyle: () => {
        return {
          borderRadius: 'md',
        };
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
        solid: () => {
          return {
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
        };
        },
        outline: () => {
          return {
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
        };
        },
        ghost: () => {
          return {
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
        };
        },
      },
    },
    TextArea: {
      baseStyle: () => {
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

const getAcceptedToS = async (): Promise<boolean> => {
  const v = await AsyncStorage.getItem('acceptedToS');
  return v === 'true';
};

export default function RootLayout() {
  const { user, isInitializing } = useAuthStore();

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = initializeAuthObserver();
    return unsubscribe;
  }, []);

  // ユーザー状態の変更を監視して画面を切り替え
  useEffect(() => {
    const run = async () => {
      if (!navigationRef.isReady()) return;

      if (user) {
        const accepted = await getAcceptedToS();
        if (!accepted) {
          navigationRef.navigate('ToS');
          return;
        }
        navigationRef.navigate('Main');
        return;
      }

      if (!user && !isInitializing) {
        navigationRef.navigate('Index');
      }
    };

    run();
  }, [user, isInitializing]);

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
            <Stack.Screen name="ToS" component={ToSScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Room" component={RoomScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="HelpAndSupport" component={HelpAndSupport} />
            <Stack.Screen name="Support" component={Support} />
          </Stack.Navigator>
        </NavigationContainer>
      </ColorModeBridge>
    </NativeBaseProvider>
  );
}
