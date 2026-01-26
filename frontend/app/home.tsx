import React, { useContext, useEffect, useState } from "react";
import {
  Box, Text, Input, ScrollView, VStack, HStack, Pressable, Badge, Divider,
  Center, Heading, Fab, Icon, Button, TextArea, KeyboardAvoidingView, useColorMode, Modal
} from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { Platform, RefreshControl, Alert, View } from "react-native"; // Viewを追加
import Constants from 'expo-constants';
import { initializeAuthObserver } from "../src/services/authService";
import { ColorModeContext } from "./hooks/ColorModeContext ";

// Bottom Tab用の型定義をインポート
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors";

import crashlytics from '@react-native-firebase/crashlytics';

type TabParamList = {
  ホーム: undefined;
  プロフィール: undefined;
  設定: undefined;
  Room: { roomId: number; name: string; nop: number; password: string };
};

type Props = BottomTabScreenProps<TabParamList, 'ホーム'>;

// 実行環境に応じてベースURLを切り替え（全て Lightsail のIPに統一）
const API_BASE_URL =
  (Constants.expoConfig?.extra)?.apiBaseUrl || 'https://api.tsuuwa.com';

type Room = { id: number; name: string; description: string; nop: number };
type RoomDetail = Room & { password?: string | null };

const Home = ({ route, navigation }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [nop, setNop] = useState(1);
  const [password, setPassword] = useState("");

  const { colorMode } = useContext(ColorModeContext);
  const { colorMode: nativeBaseColorMode } = useColorMode();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("API_BASE_URL:", API_BASE_URL);
      const res = await fetch(`${API_BASE_URL}/rooms`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET /rooms failed: ${res.status} ${res.statusText} ${text}`);
      }
      const data: Room[] = await res.json();
      setRooms(data);
    } catch (e: String | any) {
      console.error(e);
      setError(e?.message ?? "ロードに失敗しました");
      crashlytics().recordError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    initializeAuthObserver();
  }, [route, navigation]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchText.toLowerCase()) ||
      room.description.toLowerCase().includes(searchText.toLowerCase()),
  );


  // 部屋を選択したときの処理
  const handleRoomPress = async (roomId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      if (!res.ok) {
        Alert.alert('参加に失敗しました', `エラーコード: ${res.status}`, [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
        return;
      }
      const roomData: RoomDetail = await res.json();
      if (roomData.password) {
        setSelectedRoom(roomData);
        setPasswordInput("");
        setPasswordPromptVisible(true);
        return;
      }
      navigation.navigate("Room", {
        roomId,
        name: roomData.name ?? `Room ${roomId}`,
        nop: roomData.nop ?? nop,
        password: "",
      });
    } catch (e) {
      console.error(e);
      Alert.alert('参加に失敗しました', '部屋の取得に失敗しました', [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
      crashlytics().recordError(e as Error);
    }
  };

  // 部屋作成キャンセル(特に何もしない)
  const handleCancelCreate = () => {
    setIsCreateOpen(false);
    setRoomName("");
    setRoomDesc("");
    setNop(1);
    setPassword("");
  };

  // 部屋を作成する処理
  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim(), description: roomDesc.trim(), nop: nop, password: password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST /rooms failed: ${res.status} ${res.statusText} ${text}`);
      }
      await fetchRooms();
      navigation.navigate("Room", { roomId: (await res.json()).id, name: roomName.trim(), nop: nop, password: password });
    } catch (e: String | any) {
      console.error(e);
      setError(e?.message ?? "作成に失敗しました");
      crashlytics().recordError(e as Error);
    } finally {
      handleCancelCreate();
    }
  };

  // リフレッシュの処理
  const onRefresh = () => {
    fetchRooms();
  };

  const handlePasswordSubmit = () => {
    if (!selectedRoom) return;
    if (selectedRoom.password !== passwordInput) {
      Alert.alert('パスワードが違います', '入力したパスワードが正しくありません', [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
      return;
    }
    setPasswordPromptVisible(false);
    navigation.navigate("Room", {
      roomId: selectedRoom.id,
      name: selectedRoom.name ?? `Room ${selectedRoom.id}`,
      nop: selectedRoom.nop ?? nop,
      password: passwordInput,
    });
    setSelectedRoom(null);
    setPasswordInput("");
  };

  const handleClosePasswordModal = () => {
    setPasswordPromptVisible(false);
    setSelectedRoom(null);
    setPasswordInput("");
  };

  return (
    <View style={{ flex: 1 }} testID="homeScreen">
      <Box flex={1} bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"} safeArea>
        <ScrollView flex={1} px={4} py={6} pb={20} refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }>
          {/* 検索欄 */}
          <VStack space={4} mb={6}>
            <Heading size="lg" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
              部屋を探す
            </Heading>
            <Input
              placeholder="部屋名や内容で検索..."
              value={searchText}
              onChangeText={setSearchText}
              borderRadius="lg"
              px={4}
              py={3}
              fontSize="md"
              _focus={{
                borderColor: "blue.500",
              }}
            />
          </VStack>

          {/* ステータス表示 */}
          {loading && (
            <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"} mb={4}>
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
            <Text fontSize="lg" fontWeight="semibold" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
              参加可能な部屋 ({filteredRooms.length})
            </Text>

            {filteredRooms.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => handleRoomPress(room.id)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box
                  bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
                  borderRadius="lg"
                  p={4}
                  borderWidth={1}
                  borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
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
                      color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}
                      flex={1}
                      mr={3}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {room.name}
                    </Text>
                    <Badge colorScheme="blue" rounded="full" px={3} py={1} minW={16} flexShrink={0}>
                      <HStack alignItems="center" space={1}>
                        <Text fontSize="xs" fontWeight="bold" color={nativeBaseColorMode === "dark" ? "gray.900" : "white"}>
                          {room.nop}
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" color={nativeBaseColorMode === "dark" ? "gray.900" : "white"}>
                          人
                        </Text>
                      </HStack>
                    </Badge>
                  </HStack>

                  <Text
                    color={nativeBaseColorMode === "dark" ? "gray.300" : "gray.700"}
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

                  <Divider my={4} bg={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"} />

                  <Center pt={1}>
                    <Text color={nativeBaseColorMode === "dark" ? "blue.400" : "blue.600"} fontSize="sm" fontWeight="medium">
                      参加する →
                    </Text>
                  </Center>
                </Box>
              </Pressable>
            ))}

            {filteredRooms.length === 0 && (
              <Box
                bg={nativeBaseColorMode === "dark" ? "gray.800" : "gray.50"}
                borderRadius="lg"
                p={8}
                borderWidth={2}
                borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.300"}
                borderStyle="dashed"
              >
                <Center>
                  <Text color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.500"} textAlign="center" fontSize="md">
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
          icon={<Icon bg="blue.600" as={AntDesign} name="plus" color="white" size="sm" />}
          onPress={() => setIsCreateOpen(true)}
        />
        <Modal isOpen={passwordPromptVisible} onClose={handleClosePasswordModal}>
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>
              {selectedRoom?.name ?? 'パスワード入力'}
            </Modal.Header>
            <Modal.Body>
              <VStack space={3}>
                <Input
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  placeholder="パスワードを入力"
                  secureTextEntry
                  autoFocus
                />
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" onPress={handleClosePasswordModal}>
                  キャンセル
                </Button>
                <Button onPress={handlePasswordSubmit} isDisabled={!passwordInput.trim()}>
                  参加する
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
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
              bgColor={"transparent"}
            >
              <Center flex={1} px={4}>
                <Box
                  bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
                  borderRadius="lg"
                  p={4}
                  shadow={6}
                  borderWidth={1}
                  borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
                  w="100%"
                  maxW="95%"
                >
                  <VStack space={4}>
                    <Heading size="md" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
                    新しい部屋を作成
                    </Heading>
                    <Input
                    placeholder="部屋名を入力してください"
                    value={roomName}
                    onChangeText={setRoomName}
                    borderRadius="md"
                    px={4}
                    py={3}
                    fontSize="md"
                    _focus={{
                      borderColor: "blue.500",
                    }}
                    />
                    <TextArea
                    placeholder="部屋の説明を入力してください"
                    value={roomDesc}
                    onChangeText={setRoomDesc}
                    totalLines={4}
                    borderRadius="md"
                    px={4}
                    py={3}
                    fontSize="md"
                    _focus={{
                      borderColor: "blue.500",
                    }}
                    autoCompleteType={false}
                    />
                    
                    <HStack alignItems="center" space={3}>
                      <Input
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        borderRadius="md"
                        px={4}
                        py={3}
                        fontSize="md"
                        _focus={{
                          borderColor: "blue.500",
                        }}
                        placeholder="パスワード（任意）"
                      />
                    </HStack>
                    <HStack mt={4} justifyContent="flex-end" space={3}>
                    <Button
                      variant="outline"
                      onPress={handleCancelCreate}
                    >
                      キャンセル
                    </Button>

                    <Button
                      variant="solid"
                      onPress={handleCreateRoom}
                      isDisabled={!roomName.trim()}
                    >
                      作成
                    </Button>
                  </HStack>
                  </VStack>
                </Box>
              </Center>
            </KeyboardAvoidingView>
            <KeyboardAvoidingView />
          </>
        )}
      </Box>
    </View>
  );
};

export default Home;
