import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
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
import constants from 'expo-constants';

// ↓ 変更: RtcEngine ではなく createAgoraRtcEngine / IRtcEngine を使用
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  ChannelMediaOptions,
} from 'react-native-agora';

import { RootStackParamList } from "./navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// 参加者の情報
interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  avatarUrl?: string;
  speakingVolume?: number; 
}

type Props = NativeStackScreenProps<RootStackParamList, "Room">;

const AGORA_APP_ID = constants.expoConfig?.extra?.agoraAppId;

export default function RoomScreen({ navigation, route }: Props) {
  const { roomId, name } = route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { isOpen, onOpen, onClose } = useDisclose();
  const cancelRef = React.useRef(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');

  // Agora 認証関連
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [agoraUid, setAgoraUid] = useState<number | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const tokenLoadingRef = useRef(false); // ← 追加: 多重取得防止
  const [tokenError, setTokenError] = useState<string | null>(null);
  const tokenExpireAtRef = useRef<number | null>(null);
  const [agoraUserAccount, setAgoraUserAccount] = useState<string | null>(null);
  const localUserIdRef = useRef<string>('local');
  const agoraUserAccountRef = useRef<string | null>(null);

  // ↓ 変更: useRef<RtcEngine | null> ではなく IRtcEngine
  const engineRef = useRef<IRtcEngine | null>(null);
  const joinedRef = useRef(false);

  // マイクのパーミッションをリクエスト
  const requestMicPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Agora 初期化
    const initAgora = useCallback(async () => {
      if (engineRef.current || !AGORA_APP_ID) return;

    const ok = await requestMicPermission();
    if (!ok) {
      setTokenError('マイクの使用許可が必要です');
      return;
    }

    // エンジン作成
    const engine = createAgoraRtcEngine();
    engine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    engine.enableAudio();
    engine.setDefaultAudioRouteToSpeakerphone(true);
    // 音声設定を追加
    engine.adjustRecordingSignalVolume(100);
    engine.adjustPlaybackSignalVolume(100);
    engine.enableAudioVolumeIndication(500, 3, true); // 500msごとに音量インジケーションを有効化

    // イベント登録
    engine.registerEventHandler({
      onJoinChannelSuccess: (_connection, uid) => {
        console.log('[Agora] join success uid=', uid);
        setAgoraUid(uid);
        joinedRef.current = true;
        const localId = localUserIdRef.current ?? String(uid);
        setParticipants(prev => {
          const local =
            prev.find(p => p.id === 'local') ?? prev.find(p => p.id === localId);
          const me = {
            id: localId,
            name: local?.name ?? `User ${localId}`,
            isMuted: local?.isMuted ?? false,
            avatarUrl: local?.avatarUrl,
            speakingVolume: 0,
          };
          const others = prev.filter(p => p.id !== 'local' && p.id !== String(uid));
          return [me, ...others];
        });
      },
      onUserJoined: (_connection, remoteUid) => {
        console.log('[Agora] remote joined', remoteUid);
        setParticipants(prev => {
          const id = String(remoteUid);
            if (prev.some(p => p.id === id)) return prev;
            return [...prev, { id, name: `User ${remoteUid}`, isMuted: false }];
        });
      },
      onUserOffline: (_connection, remoteUid) => {
        console.log('[Agora] remote offline', remoteUid);
        setParticipants(prev => prev.filter(p => p.id !== String(remoteUid)));
      },
      onUserMuteAudio: (_connection, remoteUid, muted) => {
        console.log('[Agora] remote mute change', remoteUid, muted);
        setParticipants(prev =>
          prev.map(p =>
            p.id === String(remoteUid) ? { ...p, isMuted: !!muted } : p
          )
        );
      },
      onAudioVolumeIndication: (_connection, speakers) => {
        const localId = localUserIdRef.current ?? (agoraUid != null ? String(agoraUid) : 'local');
        setParticipants(prev =>
          prev.map(p => {
            const hit = speakers.find(s =>
              s.uid === 0 ? p.id === localId : p.id === String(s.uid)
            );

            return { ...p, speakingVolume: hit ? hit.volume : 0 };
          })
        );
      },
      onTokenPrivilegeWillExpire: () => {
        console.log('[Agora] token will expire -> renew');
        fetchNewTokenAndRenew();
      },
      onLeaveChannel: () => {
        console.log('[Agora] left channel');
        joinedRef.current = false;
      },
      onError: (error, message) => {
        console.log('[Agora] error', error, message);
        setTokenError(`Agora error ${error}: ${message}`);
      }
    });

    engineRef.current = engine;
  }, [AGORA_APP_ID]);

  // トークン更新
  const fetchNewTokenAndRenew = useCallback(async () => {
    try {
      const res = await fetch(`https://api.tsuuwa.com/rooms/${roomId}/token`);
      if (!res.ok) throw new Error('renew token fail');
      const data = await res.json();
      const expireMs =
        data.expireAt
          ? new Date(data.expireAt).getTime()
          : Date.now() + ((data.expireSeconds ?? data.expireAtSeconds ?? 3600) * 1000);
      tokenExpireAtRef.current = expireMs;
      setAgoraToken(data.token);
      if (engineRef.current) {
        engineRef.current.renewToken(data.token);
      }
    } catch (error) {
      console.error(error);
    }
  }, [roomId]);

  // トークン取得（多重呼び出し防止 & 安定した関数参照にする）
  const fetchToken = useCallback(async (opts?: { force?: boolean }) => {
    if (joinedRef.current && !opts?.force) {
      console.log('[Agora] already joined -> skip fetchToken');
      return;
    }
    if (tokenLoadingRef.current && !opts?.force) {
      console.log('[Agora] token fetch in-flight -> skip');
      return;
    }
    tokenLoadingRef.current = true;
    setTokenLoading(true);
    setTokenError(null);
    try {
      console.log('[Agora] fetch token...');
      const res = await fetch(`https://api.tsuuwa.com/rooms/${roomId}/token`);
      if (!res.ok) throw new Error(`Failed token: ${res.status}`);
      const data = await res.json();

      const rawUid = data.uid;
      let nextUid: number | null = null;
      let nextAccount: string | null = null;

      if (typeof rawUid === 'number') {
        nextUid = rawUid;
      } else if (typeof rawUid === 'string') {
        const trimmed = rawUid.trim();
        if (trimmed.length > 0) {
          nextAccount = trimmed;
        }
      }
      let effectiveUid: number | null = nextUid;
      let effectiveAccount: string | null = nextAccount;

      setAgoraUid(nextUid);
      setAgoraUserAccount(nextAccount);
      agoraUserAccountRef.current = nextAccount;
      localUserIdRef.current =
        nextAccount ?? (nextUid != null ? String(nextUid) : 'local');

      const options: ChannelMediaOptions = {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      };

      const channelId =
        typeof roomId === 'string' ? roomId.trim() : String(roomId);
      if (!channelId) {
        setTokenError('channelId が空っぽだと join できないよ');
        return;
      }
      console.log('[Agora] join params', {
        channelId,
        tokenSlice: data.token.slice(0, 12),
        hasAccount: !!nextAccount,
        nextUid,
      });

      await initAgora();
      if (engineRef.current && !joinedRef.current) {
        let joinCode = 0;

        if (nextAccount && AGORA_APP_ID) {
          const registerCode = engineRef.current.registerLocalUserAccount(
            AGORA_APP_ID,
            nextAccount,
          );
          if (registerCode !== 0) {
            throw new Error(`registerLocalUserAccount failed (${registerCode})`);
          }
          joinCode = engineRef.current.joinChannelWithUserAccount(
            data.token,
            channelId,
            nextAccount,
            options,
          );
          if (joinCode === -2 && /^\d+$/.test(nextAccount)) {
            console.log('[Agora] joinChannelWithUserAccount -2 -> fallback to numeric uid');
            effectiveAccount = null;
            effectiveUid = Number.parseInt(nextAccount, 10);
            joinCode = engineRef.current.joinChannel(
              data.token,
              channelId,
              effectiveUid,
              options,
            );
          }
        } else {
          const uidForJoin = nextUid ?? 0;
          effectiveUid = uidForJoin;
          joinCode = engineRef.current.joinChannel(
            data.token,
            channelId,
            uidForJoin,
            options,
          );
        }
        if (joinCode !== 0) {
          console.log('[Agora] joinChannel failed', joinCode);
          setTokenError(`join に失敗 (${joinCode})`);
          return;
        }

        setAgoraUid(effectiveUid);
        setAgoraUserAccount(effectiveAccount);
        agoraUserAccountRef.current = effectiveAccount;
        localUserIdRef.current =
          effectiveAccount ?? (effectiveUid != null ? String(effectiveUid) : 'local');
      }
    } catch (e: any) {
      console.log('[Agora] token error', e);
      console.log('[Agora] エラー詳細:', JSON.stringify(e));
      setTokenError(e?.message || 'トークン取得失敗');
      setAgoraToken(null);
    } finally {
      tokenLoadingRef.current = false;
      setTokenLoading(false);
    }
  }, [roomId, initAgora, agoraToken]); // ← tokenLoading を依存から外した

  // 初回レンダリング時にトークン取得 & join
  useEffect(() => {
    fetchToken();
  }, [roomId, fetchToken]);

  // トークンの有効期限が近づいたら更新
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
  }, [ fetchToken]);

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

  // ミュート切り替え
  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (engineRef.current) {
      engineRef.current.muteLocalAudioStream(next);
      const localId = localUserIdRef.current ?? (agoraUid != null ? String(agoraUid) : 'local');
      setParticipants(prev =>
        prev.map(p => (p.id === localId ? { ...p, isMuted: next } : p))
      );
    }
  };

  // 退出 & クリーンアップ
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
    console.log('Left channel and cleaned up');
  };

  // 退出ボタン押下時
  const handleLeaveRoom = () => {
    cleanupAndLeave();
    onClose();
    navigation.goBack();
    setParticipants([]);
  };

  return (
    <Box flex={1} bg={bgColor} safeArea>
      <Box bg={headerBg} px={4} py={3} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            通話ルーム
          </Text>
          <Badge bg="primary.500" _text={{ color: 'white' }} rounded="full">
            {participants.length}名参加中
          </Badge>
        </HStack>
        {tokenLoading && <Text fontSize="xs" color="gray.500">トークン取得中...</Text>}
        {tokenError && <Text fontSize="xs" color="red.500">{tokenError}</Text>}
      </Box>

      <Box flex={1} p={4}>
        {/* 参加者一覧 */}
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: participant, index }) => (
              <Box
                flex={1}
                bg={(participant.speakingVolume ?? 0) > 50 ? 'blue.600' : cardBg || 'transparent'}
                borderWidth={(participant.speakingVolume ?? 0) > 50 ? 2 : 0}
                borderColor="blue.400"
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
                        <Badge bg="red.500" _text={{ color: 'white' }} variant="solid" size="sm">
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
              bg={isMuted ? 'red.500' : 'green.500'}
              _pressed={{ bg: isMuted ? 'red.600' : 'green.600' }}
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
              bg="red.500"
              _pressed={{ bg: 'red.600' }}
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
          {/* CloseButton 差し替え: NativeBase のやつが fill="" 投げて警告出るので自作 */}
          <IconButton
            position="absolute"
            top={2}
            right={2}
            variant="ghost"
            onPress={onClose}
            _pressed={{ bg: 'transparent', opacity: 0.6 }}
            _icon={{ as: Ionicons, name: 'close', color: 'coolGray.400', size: '5' }}
            hitSlop={8}
          />
          <AlertDialog.Header>通話を終了</AlertDialog.Header>
          <AlertDialog.Body>
            本当に通話を終了しますか？
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                キャンセル
              </Button>
              <Button bg="red.500" _pressed={{ bg: 'red.600' }} onPress={handleLeaveRoom}>
                終了
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
  
}
