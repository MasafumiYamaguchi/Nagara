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
  Button,
  useToast,
  Center,
  Badge,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { signOut } from "../src/services/authService";

// Bottom Tab用の型定義をインポート
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
};

type Props = BottomTabScreenProps<TabParamList, 'プロフィール'>;

const Profile = ({ route, navigation }: Props) => {
  const { user } = useAuthStore();
  const toast = useToast();

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

  const ProfileMenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
  }) => (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          bg={isPressed ? "coolGray.100" : "white"}
          p="4"
          borderRadius="md"
          mb="2"
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
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </HStack>
        </Box>
      )}
    </Pressable>
  );

  return (
    <ScrollView bg="coolGray.50" flex={1}>
      <Box safeArea>
        {/* プロフィールヘッダー */}
        <Box bg="white" p="6" mb="4">
          <Center>
            <Avatar
              size="xl"
              source={{
                uri: user?.photoURL || undefined,
              }}
              mb="4"
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </Avatar>
            <Heading size="md" mb="1">
              {user?.displayName || "ユーザー名"}
            </Heading>
            <Text color="coolGray.600" fontSize="sm" mb="2">
              {user?.email}
            </Text>
            {user?.emailVerified && (
              <Badge colorScheme="success" variant="solid">
                メール認証済み
              </Badge>
            )}
          </Center>
        </Box>

        {/* アカウント情報セクション */}
        <Box bg="white" mx="4" borderRadius="md" p="4" mb="4">
          <Heading size="sm" mb="3" color="coolGray.700">
            アカウント情報
          </Heading>
          
          <VStack space={3}>
            <HStack justifyContent="space-between">
              <Text color="coolGray.600">ユーザーID</Text>
              <Text fontSize="sm" color="coolGray.800" maxW="200" numberOfLines={1}>
                {user?.uid}
              </Text>
            </HStack>
            
            <Divider />
            
            <HStack justifyContent="space-between">
              <Text color="coolGray.600">登録日</Text>
              <Text fontSize="sm" color="coolGray.800">
                {user?.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('ja-JP')
                  : "不明"
                }
              </Text>
            </HStack>
            
            <Divider />
            
            <HStack justifyContent="space-between">
              <Text color="coolGray.600">最終ログイン</Text>
              <Text fontSize="sm" color="coolGray.800">
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
          <Heading size="sm" mb="3" color="coolGray.700" px="2">
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
            onPress={() => console.log("プライバシー設定")}
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