import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  FlatList,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';

// ↓ 変更: RtcEngine ではなく createAgoraRtcEngine / IRtcEngine を使用
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';

import { RootStackParamList } from "./navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import dontenv from 'dotenv';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  avatarUrl?: string;
}

type Props = NativeStackScreenProps<RootStackParamList, "Room">;

dontenv.config();

const AGORA_APP_ID = process.env.AGORA_APP_ID;

export default function RoomScreen({ navigation, route }: Props) {
  const { roomId, name } = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'local', name: name || 'あなた', isMuted: false },
  ]);

  const { isOpen, onOpen, onClose } = useDisclose();
  const cancelRef = React.useRef(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');

  // Agora 認証関連
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [agoraUid, setAgoraUid] = useState<number | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const tokenExpireAtRef = useRef<number | null>(null);

  // ↓ 変更: useRef<RtcEngine | null> ではなく IRtcEngine
  const engineRef = useRef<IRtcEngine | null>(null);
  const joinedRef = useRef(false);

  // Agora 初期化
  const initAgora = useCallback(() => {
    if (engineRef.current || !AGORA_APP_ID) return;
    const engine = createAgoraRtcEngine();
    engine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    // イベント登録
    engine.registerEventHandler({
      onJoinChannelSuccess: () => {
        joinedRef.current = true;
        // 参加者 (自分) が既に追加済みならスキップ
      },
      onUserJoined: (uid) => {
        setParticipants(prev => {
          if (prev.some(p => p.id === String(uid))) return prev;
          return [...prev, { id: String(uid), name: `User ${uid}`, isMuted: false }];
        });
      },
      onUserOffline: (uid) => {
        setParticipants(prev => prev.filter(p => p.id !== String(uid)));
      },
      onUserMuteAudio: (uid, muted) => {
        setParticipants(prev =>
          prev.map(p =>
            p.id === String(uid) ? { ...p, isMuted: !!muted } : p
          )
        );
      }
    });

    engineRef.current = engine;
  }, []);

  // トークン取得
  const fetchToken = useCallback(async () => {
    setTokenLoading(true);
    setTokenError(null);
    try {
      const res = await fetch(`https://api.tsuuwa.com/rooms/${roomId}/token`);
      if (!res.ok) throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setAgoraToken(data.token);
      setAgoraUid(data.uid);
      tokenExpireAtRef.current = Date.now() + ((data.expireAtSeconds ?? 3600) * 1000);

      // 初期化 → チャンネル参加
      initAgora();
      if (engineRef.current) {
        engineRef.current.joinChannel(
          data.token,
          roomId,
          data.uid,
          { clientRoleType: ClientRoleType.ClientRoleBroadcaster }
        );
      }
    } catch (e: any) {
      setTokenError(e?.message || 'トークンの取得に失敗しました');
      setAgoraToken(null);
    } finally {
      setTokenLoading(false);
    }
  }, [roomId, initAgora]);

  // 初回
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // トークン更新チェック
  useEffect(() => {
    const id = setInterval(() => {
      if (tokenExpireAtRef.current) {
        const remain = tokenExpireAtRef.current - Date.now();
        if (remain < 60_000) {
          fetchToken();
        }
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [fetchToken]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try {
          if (joinedRef.current) {
            engineRef.current.leaveChannel();
          }
          engineRef.current.release();
        } catch {}
        engineRef.current = null;
      }
    };
  }, []);

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (engineRef.current) {
      // true でミュート
      engineRef.current.muteLocalAudioStream(next);
      setParticipants(prev =>
        prev.map(p => p.id === 'local' ? { ...p, isMuted: next } : p)
      );
    }
  };

  const cleanupAndLeave = () => {
    if (engineRef.current) {
      try {
        if (joinedRef.current) {
          engineRef.current.leaveChannel();
        }
        engineRef.current.release();
      } catch {}
      engineRef.current = null;
    }
  };

  const handleLeaveRoom = () => {
    onClose();
    cleanupAndLeave();
    navigation.goBack();
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      <Box bg={headerBg} px={4} py={3} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            通話ルーム
          </Text>
          <Badge colorScheme="blue" rounded="full">
            {participants.length}名参加中
          </Badge>
        </HStack>
        {tokenLoading && <Text fontSize="xs" color="gray.500">トークン取得中...</Text>}
        {tokenError && <Text fontSize="xs" color="red.500">{tokenError}</Text>}
      </Box>

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
                mr={index % 2 === 0 ? 2 : 0}
                ml={index % 2 === 1 ? 2 : 0}
              >
                <Box bg="black" position="relative">
                  <Center flex={1} bg="gray.600" py={8}>
                    <VStack space={2} alignItems="center">
                      <Avatar size="lg" bg="blue.500" />
                      <Text color="white" fontSize="md">
                        {participant.name}
                      </Text>
                    </VStack>
                  </Center>
                  {participant.isMuted && (
                    <Box position="absolute" top={2} right={2} bg="red.500" rounded="full" p={1}>
                      <Ionicons name="mic-off" size={16} color="white" />
                    </Box>
                  )}
                </Box>
                <Box p={3}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="semibold" fontSize="md">
                      {participant.name}
                    </Text>
                    <HStack space={1}>
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

      <Box bg={headerBg} p={4} shadow={2}>
        <HStack justifyContent="center" space={6}>
          <VStack alignItems="center">
            <IconButton
              size="lg"
              colorScheme={isMuted ? 'red' : 'green'}
              variant="solid"
              rounded="full"
              icon={<Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />}
              onPress={handleMuteToggle}
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
              icon={<Ionicons name="call" size={24} color="white" />}
              onPress={onOpen}
            />
            <Text fontSize="xs" mt={1}>
              退出
            </Text>
          </VStack>
        </HStack>
      </Box>

      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>通話を終了</AlertDialog.Header>
          <AlertDialog.Body>
            本当に通話を終了しますか？
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
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
}
