import React, { useState, useContext } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Switch,
  Pressable,
  ScrollView,
  Button,
  useToast,
  Divider,
  Center,
  Icon,
  useColorMode,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { signOut } from "../src/services/authService";
import { Alert } from "react-native";
import { ColorModeContext } from "./hooks/ColorModeContext ";

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
  const toast = useToast();
  
  // 設定状態の管理
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { colorMode: nativeBaseColorMode } = useColorMode();

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
              setTimeout(() => {
                toast.show({
                  title: "ログアウト完了",
                  description: "ログアウトしました"
                });
              }, 500);
            } catch (error) {
              setTimeout(() => {
                toast.show({
                  title: "エラー",
                  description: "ログアウトに失敗しました"
                });
            }, 500);
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
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <Box 
      bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"} 
      p="1" 
      borderRadius="md" 
      mb="1"
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
            name="person-outline"
            size={20} 
            color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#4B5563"} 
          />
        </Box>
        <VStack flex={1}>
          <Text 
            fontSize="md" 
            fontWeight="medium" 
            color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              fontSize="sm" 
              color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.500"}
            >
              {subtitle}
            </Text>
          )}
        </VStack>
        <Switch
          value={value}
          onValueChange={onValueChange}
          colorScheme="blue"
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
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <Box
          bg={pressed 
            ? (nativeBaseColorMode === "dark" ? "gray.700" : "gray.100") 
            : (nativeBaseColorMode === "dark" ? "gray.800" : "white")
          }
          p="1"
          borderRadius="md"
          mb="1"
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
                name="person-outline"
                size={20} 
                color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#4B5563"} 
              />
            </Box>
            <VStack flex={1}>
              <Text 
                fontSize="md" 
                fontWeight="medium" 
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
              >
                {title}
              </Text>
              {subtitle && (
                <Text 
                  fontSize="sm" 
                  color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {subtitle}
                </Text>
              )}
            </VStack>
            {rightElement || <Icon
              as={Ionicons}
              name="chevron-forward" 
              size={16} 
              color={nativeBaseColorMode === "dark" ? "gray.600" : "gray.300"} 
            />}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <ScrollView bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"} flex={1}>
      <Box>
        {/* ヘッダー */}
        <Box p="6" mb="4">
          <Center>
            <Heading size="lg" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
              設定
            </Heading>
            <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"} fontSize="sm" mt="1">
              アプリの設定を管理
            </Text>
          </Center>
        </Box>

        {/* アカウント設定 */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"} px="2">
            アカウント
          </Heading>
          
          <SettingsItem
            icon="person-outline"
            title="プロフィール"
            subtitle="名前、写真、基本情報"
            onPress={() => console.log("プロフィール設定")}
          />
          
          <SettingsItem
            icon="key-outline"
            title="パスワード変更"
            subtitle="パスワードを変更"
            onPress={() => console.log("パスワード変更")}
          />
          
          <SettingsItem
            icon="shield-outline"
            title="セキュリティ"
            subtitle="二段階認証、ログイン履歴"
            onPress={() => console.log("セキュリティ設定")}
          />
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
            onValueChange={() => {
              toggleColorMode();
            }}
          />
          
          <SettingsItem
            icon="information-circle-outline"
            title="アプリについて"
            subtitle="バージョン 1.0.0"
            onPress={() => console.log("アプリ情報")}
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
            onPress={() => console.log("ヘルプ")}
          />
          
          <SettingsItem
            icon="chatbubble-outline"
            title="お問い合わせ"
            subtitle="サポートチームに連絡"
            onPress={() => console.log("お問い合わせ")}
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
    </ScrollView>
  );
};


export default Settings;