import React from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Heading,
  Divider,
  Pressable,
  ScrollView,
  useToast,
  Center,
  useColorMode,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { signOut } from "../src/services/authService";

// Bottom Tab用の型定義をインポート
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
type Props = BottomTabScreenProps<TabParamList, 'プロフィール'>;

type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
};

const Profile = ({ navigation }: Props) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const { colorMode: nativeBaseColorMode } = useColorMode();
  const sessionTimestamp = React.useRef(Date.now());

  // ログアウト処理
  /*
  const handleSignOut = async () => {
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
  };
  */

  const ProfileMenuItem = ({ 
    icon,
    title, 
    subtitle, 
    onPress 
  }: { 
    icon: React.ReactNode;
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
  }) => (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          bg={
            isPressed
              ? (nativeBaseColorMode === "dark" ? "gray.700" : "gray.100")
              : (nativeBaseColorMode === "dark" ? "gray.800" : "white")
          }
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
                name="person"
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
            <Ionicons
              name="chevron-forward"
              size={16}
              color={nativeBaseColorMode === "dark" ? "#4B5563" : "#CBD5E0"}
            />
          </HStack>
        </Box>
      )}
    </Pressable>
  );

  return (
    <ScrollView bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"} flex={1}>
      <Box safeArea>
        {/* プロフィールヘッダー */}
        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
          p="6"
          mb="4"
          borderBottomWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Center>
            <Avatar
              size="xl"
              source={{
                uri: user?.photoURL
                  ? `${user.photoURL}?t=${sessionTimestamp.current}`
                  : undefined,
              }}
              mb="4"
              bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </Avatar>
            <Heading
              size="md"
              mb="1"
              color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
            >
              {user?.displayName || "ユーザー名"}
            </Heading>
            <Text
              color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}
              fontSize="sm"
              mb="2"
            >
              {user?.email}
            </Text>
            {user?.emailVerified && (
              <Box
                bg={nativeBaseColorMode === "dark" ? "green.600" : "green.500"}
                borderRadius="full"
                px="3"
                py="1"
                alignSelf="center"
              >
                <Text color="white" fontWeight="semibold" bg="transparent">
                  メール認証済み
                </Text>
              </Box>
            )}
          </Center>
        </Box>

        {/* アカウント情報セクション */}
        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
          mx="4"
          borderRadius="md"
          p="4"
          mb="4"
          borderWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Heading
            size="sm"
            mb="3"
            color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}
          >
            アカウント情報
          </Heading>
          
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
                ユーザーID
              </Text>
              <Text
                fontSize="sm"
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.800"}
                maxW="200"
                numberOfLines={1}
              >
                {user?.uid}
              </Text>
            </HStack>
            
            <Divider bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"} />
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
                登録日
              </Text>
              <Text
                fontSize="sm"
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.800"}
              >
                {user?.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('ja-JP')
                  : "不明"
                }
              </Text>
            </HStack>
            
            <Divider bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"} />
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
                最終ログイン
              </Text>
              <Text
                fontSize="sm"
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.800"}
              >
                {user?.metadata?.lastSignInTime 
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ja-JP')
                  : "不明"
                }
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* 設定メニューセクション */}
        <Box mx="4" mb="4">
          <Heading
            size="sm"
            mb="3"
            color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}
            px="2"
          >
            設定
          </Heading>
          
          <ProfileMenuItem
            icon="person-outline"
            title="プロフィール編集"
            subtitle="名前や写真を変更"
            onPress={() => console.log("プロフィール編集")}
          />
          
          <ProfileMenuItem
            icon="notifications-outline"
            title="通知設定"
            subtitle="プッシュ通知の管理"
            onPress={() => console.log("通知設定")}
          />
          
          <ProfileMenuItem
            icon="shield-outline"
            title="プライバシー設定"
            subtitle="データとプライバシー"
            onPress={() => navigation.getParent()?.navigate("Privacy")}
          />
          
          <ProfileMenuItem
            icon="help-circle-outline"
            title="ヘルプ・サポート"
            subtitle="よくある質問とお問い合わせ"
            onPress={() => console.log("ヘルプ")}
          />
        </Box>

      </Box>
    </ScrollView>
  );
};

export default Profile;