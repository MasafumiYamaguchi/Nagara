import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Pressable,
  ScrollView,
  Center,
  useColorMode,
  useToast,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";
import { PermissionsAndroid, Platform } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

const resetToS = async () => {
  try {
    await AsyncStorage.removeItem("acceptedToS");
    console.log("ToS acceptance reset.");
  } catch (error) {
    console.error("Error resetting ToS acceptance:", error);
  }
};

const resetPrivacy = async () => {
  try {
    await AsyncStorage.removeItem("acceptedPrivacy");
    console.log("Privacy acceptance reset.");
  } catch (error) {
    console.error("Error resetting Privacy acceptance:", error);
  }
};

const PrivacyScreen = ({ navigation }: Props) => {
  const { colorMode: nativeBaseColorMode } = useColorMode();
  const toast = useToast();

  const requestMicPermission = async () => {
    if (Platform.OS === "ios") {
      const currentPermission = await Audio.getPermissionsAsync();

      if (currentPermission.granted) {
        toast.show({
          title: "マイク権限はすでに許可済みです",
          placement: "bottom",
        });
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      console.log(
        status === "granted"
          ? "Microphone permission granted (iOS)"
          : "Microphone permission denied (iOS)"
      );
      return;
    }

    try {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (alreadyGranted) {
        toast.show({
          title: "マイク権限はすでに許可済みです",
          placement: "bottom",
        });
        return;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Tsuuwa マイク使用許可",
          message: "Tsuuwa アプリがマイクを使用することを許可しますか？",
          buttonNeutral: "後で聞く",
          buttonNegative: "拒否",
          buttonPositive: "許可",
        }
      );

      console.log(
        granted === PermissionsAndroid.RESULTS.GRANTED
          ? "You can use the microphone (Android)"
          : "Microphone permission denied (Android)"
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const PrivacyMenuItem = ({
    title,
    subtitle,
    icon,
    onPress,
    isDev,
  }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    isDev?: boolean;
  }) => (
    <Pressable onPress={onPress} disabled={isDev}>
      {({ isPressed }) => (
        <Box
          bg={
            isDev
              ? nativeBaseColorMode === "dark"
                ? "gray.900"
                : "gray.200"
              : isPressed
                ? nativeBaseColorMode === "dark"
                  ? "gray.700"
                  : "gray.100"
                : nativeBaseColorMode === "dark"
                  ? "gray.800"
                  : "white"
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
        {/* ヘッダー */}
        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
          p="6"
          mb="4"
          borderBottomWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
          position="relative"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            position="absolute"
            top="6"
            left="6"
            zIndex={1}
            p="1"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#111827"}
            />
          </Pressable>

          <Center>
            <Box
              bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
              p="4"
              borderRadius="full"
              mb="4"
            >
              <Ionicons
                name="shield-checkmark"
                size={28}
                color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#4B5563"}
              />
            </Box>

            <Heading
              size="md"
              mb="1"
              color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
            >
              プライバシー設定
            </Heading>

            <Text
              color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}
              fontSize="sm"
              textAlign="center"
            >
              権限とデータの管理
            </Text>
          </Center>
        </Box>

        {/* メニュー */}
        <Box mx="4" mb="6">
          <Heading
            size="sm"
            mb="3"
            color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}
            px="2"
          >
            詳細設定
          </Heading>

          <PrivacyMenuItem
            title="マイク許可をリクエスト"
            subtitle=""
            icon="mic"
            onPress={requestMicPermission}
          />
          
          
          {// 開発中のみ表示
          }
          {/*
          <PrivacyMenuItem
            title="ToS同意状態をリセット"
            subtitle="利用規約の同意状態を初期化"
            icon="refresh"
            onPress={resetToS}
          />
          <PrivacyMenuItem
            title="プライバシーポリシー同意状態をリセット"
            subtitle="プライバシーポリシーの同意状態を初期化"
            icon="refresh"
            onPress={resetPrivacy}
          />
          */}
        </Box>
      </Box>
    </ScrollView>
  );
};

export default PrivacyScreen;