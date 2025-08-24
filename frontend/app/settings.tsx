import React, { useState } from "react";
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
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { signOut } from "../src/services/authService";
import { Alert } from "react-native";

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
              toast.show({
                title: "ログアウト完了",
                description: "ログアウトしました"
              });
            } catch (error) {
              toast.show({
                title: "エラー",
                description: "ログアウトに失敗しました"
              });
            }
          },
        },
      ]
    );
  };

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
  }) => (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          bg={isPressed ? "coolGray.100" : "white"}
          p="4"
          borderRadius="md"
          mb="1"
        >
          <HStack space={3} alignItems="center">
            <Box
              bg="coolGray.200"
              p="2"
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name={icon as any} size={20} color="#4A5568" />
            </Box>
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="medium">
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="sm" color="coolGray.500">
                  {subtitle}
                </Text>
              )}
            </VStack>
            {rightElement || <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />}
          </HStack>
        </Box>
      )}
    </Pressable>
  );

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
    <Box bg="white" p="4" borderRadius="md" mb="1">
      <HStack space={3} alignItems="center">
        <Box
          bg="coolGray.200"
          p="2"
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name={icon as any} size={20} color="#4A5568" />
        </Box>
        <VStack flex={1}>
          <Text fontSize="md" fontWeight="medium">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="sm" color="coolGray.500">
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

  return (
    <ScrollView bg="coolGray.50" flex={1}>
      <Box safeArea>
        {/* ヘッダー */}
        <Box bg="white" p="6" mb="4">
          <Center>
            <Heading size="lg" color="coolGray.800">
              設定
            </Heading>
            <Text color="coolGray.600" fontSize="sm" mt="1">
              アプリの設定を管理
            </Text>
          </Center>
        </Box>

        {/* アカウント設定 */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color="coolGray.700" px="2">
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

        {/* 通知設定 */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color="coolGray.700" px="2">
            通知
          </Heading>
          
          <SwitchItem
            icon="notifications-outline"
            title="プッシュ通知"
            subtitle="アプリからの通知を受け取る"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          
          <SwitchItem
            icon="mail-outline"
            title="メール通知"
            subtitle="重要な更新をメールで受け取る"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </Box>

        {/* アプリ設定 */}
        <Box mx="4" mb="4">
          <Heading size="sm" mb="3" color="coolGray.700" px="2">
            アプリ設定
          </Heading>
          
          <SwitchItem
            icon="moon-outline"
            title="ダークモード"
            subtitle="暗いテーマを使用"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <SettingsItem
            icon="language-outline"
            title="言語"
            subtitle="日本語"
            onPress={() => console.log("言語設定")}
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
          <Heading size="sm" mb="3" color="coolGray.700" px="2">
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
          <Box mx="4" mb="6" bg="coolGray.100" p="3" borderRadius="md">
            <Text fontSize="xs" color="coolGray.600">
              ログイン中: {user.email}
            </Text>
          </Box>
        )}
      </Box>
    </ScrollView>
  );
};

export default Settings;