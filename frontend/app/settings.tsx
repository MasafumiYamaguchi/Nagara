import React, { useState, useContext } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable,
  ScrollView,
  Button,
  Center,
  Icon,
  useColorMode,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import type { Ionicons as IonIconsType } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { signOut } from "../src/services/authService";
import { Alert, Switch as RNSwitch } from "react-native";
import { ColorModeContext } from "./hooks/ColorModeContext ";

import AppInfo from "./components/appinfo";

// Bottom Tab用の型定義をインポート
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
};

type Props = BottomTabScreenProps<TabParamList, '設定'>;

const Settings = ({ route, navigation }: Props) => {
  const { user } = useAuthStore();
  
  // 設定状態の管理
  const { colorMode, setColorMode } = useContext(ColorModeContext);
  const { colorMode: nativeBaseColorMode } = useColorMode();

  // モーダルの状態管理
  const [isOpenAppInfo, setIsOpenAppInfo] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      "ログアウト",
      "本当にログアウトしますか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "ログアウト",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              console.log('User logged out');
            } catch (error) {
              console.log('Logout error', error);
            }
          },
        },
      ]
    );
  };

  const SwitchItem = ({ 
    icon, 
    title, 
    subtitle, 
    value,
    onValueChange,
    isDev,
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    subtitle?: string; 
    value: boolean;
    onValueChange: (value: boolean) => void;
    isDev?: boolean;
  }) => (
    <Box
      bg={
        isDev
          ? (nativeBaseColorMode === "dark" ? "gray.900" : "gray.200")
          : (nativeBaseColorMode === "dark" ? "gray.800" : "white")
      }
      opacity={isDev ? 0.6 : 1}
      p="4"
      borderRadius="md"
      mb="2"
      borderWidth={1}
      borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
    >
      <HStack space={3} alignItems="center">
        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.100"}
          p="2"
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons 
            name={icon}
            size={20} 
            color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#4B5563"} 
          />
        </Box>
        <VStack flex={1}>
          <HStack alignItems="center" space={2}>
            <Text 
              fontSize="md" 
              fontWeight="medium" 
              color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
            >
              {title}
            </Text>
            {isDev && (
              <Box
                bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.300"}
                px="2"
                py="0.5"
                borderRadius="full"
              >
                <Text
                  fontSize="xs"
                  color={nativeBaseColorMode === "dark" ? "gray.200" : "gray.700"}
                >
                  開発中
                </Text>
              </Box>
            )}
          </HStack>
          {subtitle && (
            <Text 
              fontSize="sm" 
              color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.500"}
            >
              {subtitle}
            </Text>
          )}
        </VStack>
        <RNSwitch
          value={value}
          onValueChange={onValueChange}
          disabled={isDev}
        />
      </HStack>
    </Box>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    rightElement,
    isDev,
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isDev?: boolean;
  }) => (
    <Pressable onPress={onPress} disabled={isDev}>
      {({ isPressed }) => (
        <Box
          bg={
            isDev
              ? (nativeBaseColorMode === "dark" ? "gray.900" : "gray.200")
              : isPressed
                ? (nativeBaseColorMode === "dark" ? "gray.700" : "gray.100")
                : (nativeBaseColorMode === "dark" ? "gray.800" : "white")
          }
          opacity={isDev ? 0.6 : 1}
          p="4"
          borderRadius="md"
          mb="2"
          borderWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <HStack space={3} alignItems="center">
            <Box
              bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.100"}
              p="2"
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons 
                name={icon}
                size={20} 
                color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#4B5563"} 
              />
            </Box>
            <VStack flex={1}>
              <HStack alignItems="center" space={2}>
                <Text 
                  fontSize="md" 
                  fontWeight="medium" 
                  color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
                >
                  {title}
                </Text>
                {isDev && (
                  <Box
                    bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.300"}
                    px="2"
                    py="0.5"
                    borderRadius="full"
                  >
                    <Text
                      fontSize="xs"
                      color={nativeBaseColorMode === "dark" ? "gray.200" : "gray.700"}
                    >
                      開発中
                    </Text>
                  </Box>
                )}
              </HStack>
              {subtitle && (
                <Text 
                  fontSize="sm" 
                  color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {subtitle}
                </Text>
              )}
            </VStack>
            {rightElement ?? (
              <Icon
                as={Ionicons}
                name="chevron-forward" 
                size={4} 
                color={nativeBaseColorMode === "dark" ? "gray.600" : "gray.300"} 
              />
            )}
          </HStack>
        </Box>
      )}
    </Pressable>
  );

  return (
    <ScrollView bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"} flex={1}>
      <Box>
        {/* ヘッダー */}
        <Box p="6" mb="4" pt="16">
          <Center>
            <Heading size="lg" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
              設定
            </Heading>
            <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"} fontSize="sm" mt="1">
              アプリの設定を管理
            </Text>
          </Center>
        </Box>

        {/* アプリ設定 */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"} px="2">
            アプリ設定
          </Heading>
          
          <SwitchItem
            icon="moon-outline"
            title="ダークモード"
            subtitle="暗いテーマを使用"
            value={colorMode === 'dark'}
            onValueChange={(value) => {
              setColorMode(value ? "dark" : "light");
            }}
            isDev={false}
          />
          
          <SettingsItem
            icon="information-circle-outline"
            title="アプリについて"
            subtitle="バージョン 1.0.0"
            onPress={() => setIsOpenAppInfo(true)}
          />
        </Box>

        {/* サポート */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"} px="2">
            サポート
          </Heading>
          
          <SettingsItem
            icon="help-circle-outline"
            title="ヘルプ"
            subtitle="よくある質問"
            onPress={() => navigation.navigate("HelpAndSupport")}
          />
          
          <SettingsItem
            icon="chatbubble-outline"
            title="お問い合わせ"
            subtitle="サポートチームに連絡"
            onPress={() => navigation.navigate("Support")}
          />

          <SettingsItem
            icon="chatbubble-outline"
            title="利用規約"
            subtitle="利用規約を確認"
            onPress={() => navigation.navigate("ToSrecheck")}
          />

          <SettingsItem
            icon="shield-checkmark-outline"
            title="プライバシーポリシー"
            subtitle="プライバシーポリシーを確認"
            onPress={() => navigation.navigate("PrivacyPolicyRecheck")}
          />
        </Box>

        {/* ログアウト */}
        <Box mx="4" mb="6">
          <Button
            colorScheme="red"
            variant="outline"
            onPress={handleSignOut}
            leftIcon={<Ionicons name="log-out-outline" size={16} color="#E53E3E" />}
            size="lg"
          >
            ログアウト
          </Button>
        </Box>

        {/* ユーザー情報（デバッグ用） */}
        {user && (
          <Box mx="4" mb="6" bg={nativeBaseColorMode === "dark" ? "gray.800" : "gray.100"} p="3" borderRadius="md">
            <Text fontSize="xs" color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
              ログイン中: {user.email}
            </Text>
          </Box>
        )}
      </Box>
      {/* アプリ情報モーダル */}
      {isOpenAppInfo && (
        <AppInfo isOpen={isOpenAppInfo} onClose={() => setIsOpenAppInfo(false)} />
      )}
    </ScrollView>
  );
};


export default Settings;