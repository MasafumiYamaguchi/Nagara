import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Text,
  Input,
  ScrollView,
  VStack,
  HStack,
  Pressable,
  Badge,
  Divider,
  Center,
  Heading,
} from "native-base";
import React, { useEffect, useState } from "react";

import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Index({ route, navigation }: Props) {
  const [searchText, setSearchText] = useState("");

  // サンプルの部屋データ
  const rooms = [
    {
      id: 1,
      name: "フロントエンド勉強会",
      participants: 12,
      description: "React/React Nativeについて話し合いましょう",
    },
    {
      id: 2,
      name: "バックエンド開発",
      participants: 8,
      description: "Node.js、Python、データベース設計など",
    },
    {
      id: 3,
      name: "デザイン相談室",
      participants: 15,
      description: "UI/UXデザインのフィードバックと相談",
    },
    {
      id: 4,
      name: "プロジェクト管理",
      participants: 6,
      description: "アジャイル開発とプロジェクト運営",
    },
    {
      id: 5,
      name: "フリートーク",
      participants: 20,
      description: "技術やキャリアについて自由に話しましょう",
    },
  ];

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchText.toLowerCase()) ||
      room.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  useEffect(() => {
    console.log("Home screen mounted");
    return () => {
      console.log("Home screen unmounted");
    };
  }, [route, navigation]);

  const handleRoomPress = (roomId: number) => {
    console.log(`Room ${roomId} selected`);
    // ここで部屋画面への遷移処理を追加
    // navigation.navigate("Room", { roomId });
  };

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView flex={1} px={4} py={6}>
        {/* 検索欄 */}
        <VStack space={4} mb={6}>
          <Heading size="lg" color="gray.800">
            部屋を探す
          </Heading>
          <Input
            placeholder="部屋名や内容で検索..."
            value={searchText}
            onChangeText={setSearchText}
            bg="white"
            borderColor="gray.300"
            borderRadius="lg"
            px={4}
            py={3}
            fontSize="md"
            placeholderTextColor="gray.400"
            _focus={{
              borderColor: "blue.500",
              bg: "white",
            }}
          />
        </VStack>

        {/* 部屋一覧 */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            参加可能な部屋 ({filteredRooms.length})
          </Text>

          {filteredRooms.map((room) => (
            <Pressable
              key={room.id}
              onPress={() => handleRoomPress(room.id)}
              _pressed={{
                opacity: 0.8,
              }}
            >
              <Box
                bg="white"
                borderRadius="lg"
                p={4}
                borderWidth={1}
                borderColor="gray.300"
                shadow={2}
              >
                <HStack
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={4}
                >
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.900"
                    flex={1}
                    mr={3}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {room.name}
                  </Text>
                  <Badge
                    colorScheme="blue"
                    rounded="full"
                    px={3}
                    py={1}
                    minW={16}
                    flexShrink={0}
                  >
                    <HStack alignItems="center" space={1}>
                      <Text fontSize="xs" fontWeight="bold" color="black">
                        {room.participants}
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" color="black">
                        人
                      </Text>
                    </HStack>
                  </Badge>
                </HStack>

                <Text
                  color="gray.700"
                  fontSize="sm"
                  lineHeight={30}
                  mt={2}
                  mb={2}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  textAlign="left"
                >
                  {room.description}
                </Text>

                <Divider my={4} />

                <Center pt={1}>
                  <Text color="blue.600" fontSize="sm" fontWeight="medium">
                    参加する →
                  </Text>
                </Center>
              </Box>
            </Pressable>
          ))}

          {filteredRooms.length === 0 && (
            <Box
              bg="white"
              borderRadius="lg"
              p={8}
              borderWidth={2}
              borderColor="gray.300"
              borderStyle="dashed"
            >
              <Center>
                <Text color="gray.500" textAlign="center" fontSize="md">
                  検索条件に一致する部屋が見つかりません
                </Text>
              </Center>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
