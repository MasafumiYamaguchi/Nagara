import React, { useEffect, useState } from "react";
import {
  Box, Text, Input, ScrollView, VStack, HStack, Pressable, Badge, Divider,
  Center, Heading, Fab, Icon, Button, TextArea, KeyboardAvoidingView
} from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { Platform } from "react-native";

// Bottom Tab用の型定義をインポート
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
  Room: { roomId: number; name: string; nop: number };
};

type Props = BottomTabScreenProps<TabParamList, 'ホーム'>;

// 実行環境に応じてベースURLを切り替え
const API_BASE_URL =
  Platform.select({
    ios: "http://localhost:3000",     // iOSシミュレータ
    android: "http://10.0.2.2:3000",  // Androidエミュレータ
    default: "http://192.168.0.10:3000", // 実機の場合は開発PCのLAN IPに置き換え
  }) ?? "http://192.168.0.10:3000";

type Room = { id: number; name: string; description: string; nop: number };

const Home = ({ route, navigation }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      if (!res.ok) throw new Error(`Failed to load rooms: ${res.status}`);
      const data: Room[] = await res.json();
      setRooms(data);
    } catch (e: any) {
      setError(e.message ?? "ロードに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [route, navigation]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchText.toLowerCase()) ||
      room.description.toLowerCase().includes(searchText.toLowerCase()),
  );


  // 部屋を選択したときの処理
  const handleRoomPress = (roomId: number) => {
    console.log(`Room ${roomId} selected`);
    navigation.navigate("Room", { roomId, name: "サンプル部屋", nop: 5 });
  };

  // 部屋作成キャンセル(特に何もしない)
  const handleCancelCreate = () => {
    setIsCreateOpen(false);
    setRoomName("");
    setRoomDesc("");
  };

  // 部屋を作成する処理
  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim(), description: roomDesc.trim(), nop: 1 }),
      });
      if (!res.ok) throw new Error(`作成に失敗しました: ${res.status}`);
      await fetchRooms(); // 作成後に一覧をリロード
      // 必要なら作成した部屋へ遷移
      // const created = await res.json();
      // navigation.navigate("Room", { roomId: created.id, name: created.name, nop: created.nop });
    } catch (e) {
      console.error(e);
    } finally {
      handleCancelCreate();
    }
  };

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView flex={1} px={4} py={6} pb={20}>
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

        {/* ステータス表示 */}
        {loading && (
          <Text color="gray.500" mb={4}>
            読み込み中...
          </Text>
        )}
        {error && (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        )}

        {/* 部屋一覧 */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            参加可能な部屋 ({filteredRooms.length})
          </Text>

          {filteredRooms.map((room) => (
            <Pressable
              key={room.id}
              onPress={() => handleRoomPress(room.id)}
              _pressed={{ opacity: 0.8 }}
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
                  <Badge colorScheme="blue" rounded="full" px={3} py={1} minW={16} flexShrink={0}>
                    <HStack alignItems="center" space={1}>
                      <Text fontSize="xs" fontWeight="bold" color="black">
                        {room.nop}
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
      <Fab
        placement="bottom-right"
        renderInPortal={false}
        bg="blue.600"
        shadow={4}
        size="sm"
        w={12}
        h={12}
        bottom={6}
        right={6}
        rounded="full"
        icon={<Icon as={AntDesign} name="plus" color="white" size="sm" />}
        onPress={() => setIsCreateOpen(true)}
      />
      {isCreateOpen && (
        <>
          <Pressable
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            bg="black"
            opacity={0.35}
            onPress={handleCancelCreate}
            zIndex={10}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 11,
            }}
          >
            <Center flex={1} px={4}>
              <Box
                bg="white"
                borderRadius="lg"
                p={4}
                shadow={6}
                borderWidth={1}
                borderColor="gray.200"
                w="100%"
                maxW="95%"
              >
                <VStack space={3}>
                  <Heading size="md" color="gray.800">
                    新しい部屋を作成
                  </Heading>
                  <Input
                    placeholder="部屋名"
                    value={roomName}
                    onChangeText={setRoomName}
                    bg="gray.50"
                    borderColor="gray.300"
                  />
                  <TextArea
                    placeholder="部屋の説明"
                    value={roomDesc}
                    onChangeText={setRoomDesc}
                    totalLines={4}
                    bg="gray.50"
                    borderColor="gray.300"
                    autoCompleteType="off"
                  />
                  <HStack justifyContent="flex-end" space={2} pt={1}>
                    <Button variant="ghost" colorScheme="coolGray" onPress={handleCancelCreate}>
                      キャンセル
                    </Button>
                    <Button colorScheme="blue" isDisabled={!roomName.trim()} onPress={handleCreateRoom}>
                      作成
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Center>
          </KeyboardAvoidingView>
        </>
      )}
    </Box>
  );
};

export default Home;
