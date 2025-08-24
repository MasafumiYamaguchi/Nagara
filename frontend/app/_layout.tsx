import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider } from "native-base";
import { initializeAuthObserver } from "../src/services/authService";
import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../src/store/authStore";
import { ActivityIndicator, View } from "react-native";
import { createNavigationContainerRef } from '@react-navigation/native';

import IndexScreen from "./index";
import LoginScreen from "./login";
import { RootStackParamList } from "./navigation/types";
import RegisterScreen from "./register";
import BottomTabNavigator from "./tab/bottomtabnavigator"; // BottomTabNavigatorをインポート

const Stack = createNativeStackNavigator<RootStackParamList>();

// ナビゲーション参照を作成
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootLayout() {
  const { user, isInitializing } = useAuthStore();
  
  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = initializeAuthObserver();
    return unsubscribe;
  }, []);

  // ユーザー状態の変更を監視して画面を切り替え
  useEffect(() => {
    // ナビゲーションが準備完了していて、かつユーザーがログインしている場合
    if (navigationRef.isReady() && user) {
      // ホーム画面に遷移
      navigationRef.navigate("Main");
    } else if (navigationRef.isReady() && !user && !isInitializing) {
      // 未ログインで初期化が完了している場合はIndex画面に遷移
      navigationRef.navigate("Index");
    }
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
    <NativeBaseProvider>
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
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
