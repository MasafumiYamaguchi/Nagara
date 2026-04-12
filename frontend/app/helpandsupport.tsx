import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable,
  ScrollView,
  Divider,
  Icon,
  useColorMode,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "HelpAndSupport">;

type FAQItemType = {
  id: string;
  question: string;
  answer: string;
  isDev?: boolean;
};

const faqItems: FAQItemType[] = [
  {
    id: "1",
    question: "アカウント情報はどこで変更できる？",
    answer: "プロフィール画面の「プロフィール編集」から変更できます。",
  },
  {
    id: "2",
    question: "どうやって部屋を作るの？",
    answer: "ホーム画面右下の＋ボタンをタップして、部屋の作成画面に進んでください。",
  },
  {
    id: "3",
    question: "退会の方法は？",
    answer: "プロフィール画面の「退会する」ボタンから退会手続きを行うと、Firebase Authentication上のアカウント情報およびFirestore上のユーザーデータが削除されます。なお、退会後はアカウントの復元はできませんのでご注意ください。",
  },
  {
    id: "4",
    question: "データ削除の方法は？",
    answer: "設定 > プライバシー設定から申請できるように準備中。",
    isDev: true,
  },
];

const HelpAndSupport = (props: Props) => {
  const { colorMode: nativeBaseColorMode } = useColorMode();
  const [openId, setOpenId] = React.useState<string | null>(faqItems[0]?.id ?? null);

  const SupportMenuItem = ({
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

            <Icon
              as={Ionicons}
              name="chevron-forward"
              size={4}
              color={nativeBaseColorMode === "dark" ? "gray.600" : "gray.300"}
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
        >
          <HStack alignItems="center" mb="2">
            <Pressable onPress={() => props.navigation.goBack()} mr="3">
              <Ionicons
                name="chevron-back"
                size={22}
                color={nativeBaseColorMode === "dark" ? "#E5E7EB" : "#111827"}
              />
            </Pressable>
            <Heading size="md" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
              ヘルプ・サポート
            </Heading>
          </HStack>
          <Text mt="1" color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
            よくある質問とお問い合わせ
          </Text>
        </Box>

        {/* FAQ */}
        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
          mx="4"
          borderRadius="md"
          p="4"
          mb="4"
          borderWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Heading size="sm" mb="3" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}>
            よくある質問
          </Heading>

          <VStack space={2}>
            {faqItems.map((item, index) => {
              const opened = openId === item.id;
              return (
                <Box key={item.id}>
                  <Pressable
                    onPress={() => !item.isDev && setOpenId(opened ? null : item.id)}
                    disabled={item.isDev}
                  >
                    {({ isPressed }) => (
                      <Box
                        bg={
                          item.isDev
                            ? nativeBaseColorMode === "dark"
                              ? "gray.900"
                              : "gray.200"
                            : isPressed
                              ? nativeBaseColorMode === "dark"
                                ? "gray.700"
                                : "gray.100"
                              : "transparent"
                        }
                        opacity={item.isDev ? 0.6 : 1}
                        p="2"
                        borderRadius="md"
                      >
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack alignItems="center" space={2} flex={1} pr="2">
                            <Ionicons
                              name="help-circle-outline"
                              size={18}
                              color={nativeBaseColorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                            />
                            <Text
                              flex={1}
                              fontSize="sm"
                              fontWeight="medium"
                              color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
                            >
                              {item.question}
                            </Text>
                            {item.isDev && (
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

                          <Ionicons
                            name={opened ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={nativeBaseColorMode === "dark" ? "#6B7280" : "#9CA3AF"}
                          />
                        </HStack>

                        {opened && (
                          <Text
                            mt="2"
                            ml="7"
                            fontSize="sm"
                            color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.600"}
                          >
                            {item.answer}
                          </Text>
                        )}
                      </Box>
                    )}
                  </Pressable>

                  {index < faqItems.length - 1 && (
                    <Divider my="1" bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"} />
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* サポート */}
        <Box mx="4" mb="4">
          <Heading
            size="sm"
            mb="3"
            color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}
            px="2"
          >
            サポート
          </Heading>

          <SupportMenuItem
            title="お問い合わせ・不具合報告"
            subtitle="アプリの使い方や不具合についてはこちらからご連絡ください。"
            icon="mail-outline"
            onPress={() => props.navigation.navigate("Support")}
          />
        </Box>
      </Box>
    </ScrollView>
  );
};

export default HelpAndSupport;