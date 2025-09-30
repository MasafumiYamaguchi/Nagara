import React, { useCallback, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
  Center,
  AlertDialog,
  useDisclose,
  Stack,
  FlatList, // ← 追加
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  avatarUrl?: string;
}

import { RootStackParamList } from "./navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Room">;

export default function RoomScreen({ navigation, route }: Props) {
  const { roomId, name, nop } = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'あなた', isMuted: false, isVideoOn: true },
    { id: '2', name: '田中さん', isMuted: false, isVideoOn: true },
    { id: '3', name: '佐藤さん', isMuted: true, isVideoOn: false },
    { id: '4', name: '山田さん', isMuted: false, isVideoOn: true },
    { id: '5', name: '鈴木さん', isMuted: false, isVideoOn: true },
    { id: '6', name: '高橋さん', isMuted: false, isVideoOn: false },
  ]);

  const { isOpen, onOpen, onClose } = useDisclose();
  const cancelRef = React.useRef(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');

  // Agora認証関連
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [agoraUid, setAgoraUid] = useState<number | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const tokenExpireAtRef = React.useRef<number | null>(null);

  const fetchToken = useCallback(async () => {
    setTokenLoading(true);
    setTokenError(null);
    try {
      const res = await fetch(`https://api.tsuuwa.com/rooms/${roomId}/token`);
      if (!res.ok) {
        throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setAgoraToken(data.token);
      setAgoraUid(data.uid);
      tokenExpireAtRef.current = Date.now() + (data.expireAt || 3600) * 1000; // ミリ秒に変換

      // Agoraエンジンの処理をここに追加

    } catch (e: any) {
      setTokenError(e?.message || 'トークンの取得に失敗しました');
      setAgoraToken(null);
    } finally {
      setTokenLoading(false);
    }

  }, [roomId]);

  // 初回取得
  React.useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // トークンの有効期限チェックと更新
  React.useEffect(() => {
    const id = setTimeout(() => {
      if ( tokenExpireAtRef.current) {
        const remain = tokenExpireAtRef.current - Date.now();
        if ( remain < 60_000 ) { // 1分未満なら更新
          fetchToken();
        }
      }
    }, 60_000); // 1分ごとにチェック

    return () => clearInterval(id);
  }, [fetchToken]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleLeaveRoom = () => {
    onClose();
    // 退出処理
    console.log('通話を終了しました');
    navigation.goBack();
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* ヘッダー */}
      <Box bg={headerBg} px={4} py={3} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            通話ルーム
          </Text>
          <Badge colorScheme="blue" variant="solid" rounded="full">
            {participants.length}名参加中
          </Badge>
        </HStack>
      </Box>

      {/* 参加者グリッド */}
      <Box flex={1} p={4}>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: participant, index }) => (
            <Box
              flex={1}
              bg={cardBg}
              rounded="xl"
              shadow={3}
              overflow="hidden"
              mb={4}
              mr={index % 2 === 0 ? 2 : 0} // 左タイルに右マージン
              ml={index % 2 === 1 ? 2 : 0} // 右タイルに左マージン
            >
              {/* ビデオエリア */}
              <Box bg="black" position="relative">
                {participant.isVideoOn ? (
                  <Center flex={1} py={8}>
                    <VStack space={2} alignItems="center">
                      <Ionicons name="videocam" size={40} color="white" />
                      <Text color="white" fontSize="md">
                        {participant.name}
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <Center flex={1} bg="gray.600" py={8}>
                    <VStack space={2} alignItems="center">
                      <Avatar size="lg" bg="blue.500" />
                      <Text color="white" fontSize="md">
                        {participant.name}
                      </Text>
                    </VStack>
                  </Center>
                )}

                {/* ミュート状態表示 */}
                {participant.isMuted && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="red.500"
                    rounded="full"
                    p={1}
                  >
                    <Ionicons name="mic-off" size={16} color="white" />
                  </Box>
                )}
              </Box>

              {/* 参加者情報 */}
              <Box p={3}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="semibold" fontSize="md">
                    {participant.name}
                  </Text>
                  <HStack space={1}>
                    {!participant.isVideoOn && (
                      <Badge colorScheme="gray" variant="subtle" size="sm">
                        ビデオオフ
                      </Badge>
                    )}
                    {participant.isMuted && (
                      <Badge colorScheme="red" variant="subtle" size="sm">
                        ミュート
                      </Badge>
                    )}
                  </HStack>
                </HStack>
              </Box>
            </Box>
          )}
        />
      </Box>

      {/* 下部コントロール */}
      <Box bg={headerBg} p={4} shadow={2}>
        <HStack justifyContent="center" space={6}>
          <VStack alignItems="center">
            <IconButton
              size="lg"
              colorScheme={isMuted ? 'red' : 'green'}
              variant="solid"
              rounded="full"
              icon={
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color="white"
                />
              }
              onPress={handleMuteToggle}
              _pressed={{ bg: "blue.600" }}
            />
            <Text fontSize="xs" mt={1}>
              {isMuted ? 'ミュート解除' : 'ミュート'}
            </Text>
          </VStack>

          <VStack alignItems="center">
            <IconButton
              size="lg"
              colorScheme="red"
              variant="solid"
              rounded="full"
              icon={
                <Ionicons
                  name="call"
                  size={24}
                  color="white"
                />
              }
              onPress={onOpen}
              _pressed={{ bg: "red.600" }}
            />
            <Text fontSize="xs" mt={1}>
              退出
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* 退出確認ダイアログ */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>通話を終了</AlertDialog.Header>
          <AlertDialog.Body>
            本当に通話を終了しますか？
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onClose}
                ref={cancelRef}
              >
                キャンセル
              </Button>
              <Button colorScheme="red" onPress={handleLeaveRoom}>
                終了
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};
