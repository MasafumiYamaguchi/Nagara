import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 画面コンポーネントをインポート（パスを修正）
import HomeScreen from '../home';
import ProfileScreen from '../profile';
import SettingsScreen from '../settings';

// タブナビゲーションの型定義
type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'ホーム':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'プロフィール':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case '設定':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="ホーム" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="プロフィール" 
        component={ProfileScreen}
      />
      <Tab.Screen 
        name="設定" 
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;