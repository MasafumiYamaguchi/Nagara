import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable,
  ScrollView,
  Input,
  TextArea,
  Button,
  useColorMode,
  useToast,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";
import { getApp } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";

import { useAuthStore } from "../src/store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "Support">;

const categories = [
  { key: "usage", label: "使い方" },
  { key: "bug", label: "不具合" },
  { key: "request", label: "要望" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

const Support = (props: Props) => {
  const toast = useToast();
  const { colorMode: nativeBaseColorMode } = useColorMode();

  const [category, setCategory] = React.useState<CategoryKey>("bug");
  const [title, setTitle] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const { user } = useAuthStore();

  const app = getApp();
  const db = getFirestore(app);

  const canSubmit = title.trim().length > 0 && detail.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // TODO: API接続時にここで送信
    try {
        if (db.collection("support") === undefined) {
            throw new Error("Firestore collection 'support' is not defined");
        }
        db.collection("support").add({
            category,
            title,
            detail,
            email: user?.email || null,
            createdAt: new Date(),
        });
    } catch (e) {
        console.warn("サポートリクエストの送信に失敗しました", e);
        toast.show({
            description: "送信に失敗しました。もう一度お試しください。",
            placement: "bottom",
        });
        return `Support request submission failed: ${e}`;
    }
    console.log("support submit", { category, title, detail, email: user?.email });

    toast.show({
      description: "送信が完了しました。ご協力ありがとうございます！",
      placement: "bottom",
    });

    setTitle("");
    setDetail("");
  };

  return (
    <ScrollView bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"} flex={1}>
      <Box safeArea>
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
              お問い合わせ・不具合報告
            </Heading>
          </HStack>
          <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
            使い方や不具合についてはこちらからご連絡ください。
          </Text>
          <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
            返信が必要な場合は、プロフィールに登録されている{"\n"}メールアドレス宛にご連絡いたします。
          </Text>
        </Box>

        <Box
          bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
          mx="4"
          borderRadius="md"
          p="4"
          mb="4"
          borderWidth={1}
          borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <VStack space={4}>
            <Box>
              <Text mb="2" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}>
                種別
              </Text>
              <HStack space={2} flexWrap="wrap">
                {categories.map((item) => {
                  const selected = category === item.key;
                  return (
                    <Pressable key={item.key} onPress={() => setCategory(item.key)}>
                      <Box
                        px="3"
                        py="2"
                        borderRadius="full"
                        borderWidth={1}
                        borderColor={
                          selected
                            ? "blue.400"
                            : nativeBaseColorMode === "dark"
                              ? "gray.600"
                              : "gray.300"
                        }
                        bg={
                          selected
                            ? nativeBaseColorMode === "dark"
                              ? "blue.900"
                              : "blue.50"
                            : "transparent"
                        }
                      >
                        <Text
                          color={
                            selected
                              ? nativeBaseColorMode === "dark"
                                ? "blue.200"
                                : "blue.700"
                              : nativeBaseColorMode === "dark"
                                ? "gray.300"
                                : "gray.700"
                          }
                        >
                          {item.label}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </Box>

            <Box>
              <Text mb="2" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}>
                件名
              </Text>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="例）ログインできない"
                bg={nativeBaseColorMode === "dark" ? "gray.900" : "white"}
                borderColor={nativeBaseColorMode === "dark" ? "gray.600" : "gray.300"}
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
                _focus={{
                  borderColor: "blue.400",
                  bg: nativeBaseColorMode === "dark" ? "gray.900" : "white",
                }}
              />
            </Box>

            <Box>
              <Text mb="2" color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}>
                詳細
              </Text>
              <TextArea
                value={detail}
                onChangeText={setDetail}
                placeholder="詳細をお書きください。"
                bg={nativeBaseColorMode === "dark" ? "gray.900" : "white"}
                borderColor={nativeBaseColorMode === "dark" ? "gray.600" : "gray.300"}
                color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
                _focus={{
                  borderColor: "blue.400",
                  bg: nativeBaseColorMode === "dark" ? "gray.900" : "white",
                }}
                h={24}
                autoCompleteType="off"
              />
            </Box>

            <Button
              onPress={handleSubmit}
              isDisabled={!canSubmit}
              bg="blue.500"
              _pressed={{ bg: "blue.600" }}
              _disabled={{
                bg: nativeBaseColorMode === "dark" ? "gray.700" : "gray.300",
              }}
            >
              送信する
            </Button>
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default Support;