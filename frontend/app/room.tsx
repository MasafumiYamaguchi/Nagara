import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Platform, PermissionsAndroid, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  Icon,
  IconButton,
  useColorModeValue,
  Center,
  AlertDialog,
  useDisclose,
  FlatList,
  Fab,
  PresenceTransition,
  Pressable,
  Menu,
} from 'native-base';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import constants from 'expo-constants';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  ChannelMediaOptions,
} from 'react-native-agora';

import { getApp } from '@react-native-firebase/app';

import crashlytics from '@react-native-firebase/crashlytics';

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

import ReportUserDialog from './components/reportuserdialog';

// BGM用意
import { Audio } from 'expo-av';
import bonfire from '../assets/music/bonfire.mp3';
import brownnoise from '../assets/music/brownnoise.mp3';

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
  const [bgmSound, setBgmSound] = useState<Audio.Sound | null>(null);
  // ★追加: 誰がどのリアクション中かを管理するState
  const [activeReactions, setActiveReactions] = useState<Record<string, string>>({});

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

  // リアクションボタン用
  const [showReaction, setShowReaction] = useState(false);
  // FAB の位置を一元化（トレーもそこ基準に出す）
  const insets = useSafeAreaInsets();
  const FAB_SIZE = 56; // NativeBaseのデフォルトFABサイズ想定
  const REACTION_FAB_BOTTOM = 26 + insets.bottom;     // Homeインジケータを避ける
  const REACTION_FAB_RIGHT = 4;

  // 追加: displayName キャッシュ（同じユーザーを何度も読まない）
  const nameCacheRef = useRef<Record<string, string>>({});
  const reactionList = ['👍', '🎉', '😂', '😮', '😢', '🙏'];
  // 追加: リアクションボタンの見た目サイズ
  const REACTION_ITEM_SIZE = 36;
  const REACTION_EMOJI_SIZE = 28;

  // アプリインスタンスを取得 
    const app = getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
  // Agoraのuid→userAccountのマップ
  const uidAccountMapRef = useRef<Record<string, string>>({});

  // 通報用のストア
  const [isOpenReportDialog, setIsOpenReportDialog] = useState(false);
  const [reportedUserId, setReportedUserId] = useState<string | undefined>(undefined);

  // 追加/修正: Firestore から表示名を取得（RN Firebase流）
  const getDisplayName = useCallback(async (id: string) => {
    if (!id) return null;
    if (nameCacheRef.current[id]) return nameCacheRef.current[id];

    try {
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists) {
        const fallback = `User ${id}`;
        nameCacheRef.current[id] = fallback;
        return fallback;
      }
      const data = userDoc.data() as any;
      // displayName がない場合のフォールバックを拡張
      const displayName =
        (data?.displayName as string)
        ?? `User ${id}`;

      nameCacheRef.current[id] = displayName;

      setParticipants(prev =>
        prev.map(p => (p.id === id ? { ...p, name: displayName } : p))
      );
      console.log('[Firestore] users/%s ->', id, data);
      return displayName;
    } catch (e) {
      console.warn('getDisplayName failed', e);
      crashlytics().recordError(e as Error);
      return `User ${id}`;
    }
  }, [db]);

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

  // Agora 初期化 (RTCの方)
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
      onJoinChannelSuccess: async (_connection, uid) => {
        console.log('[Agora] join success uid=', uid);
        setAgoraUid(uid);
        joinedRef.current = true;
        const accountOrUid = uidAccountMapRef.current[uid] ?? uid;
        const localId = localUserIdRef.current ?? String(uid);
        const displayName = await getDisplayName(accountOrUid); // ここ怪しいかも
        if (!displayName) return;
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
        // account をキーにして名前を更新
        setParticipants(prev =>
          prev.map(p => (p.id === accountOrUid ? { ...p, name: displayName } : p))
        );

        // 追加: Firestore から自分の表示名を取得して更新
        getDisplayName(localId).catch(() => {});
      },
      onUserJoined: (_connection, remoteUid) => {
        console.log('[Agora] remote joined', remoteUid);
        const uid = String(remoteUid);
        const initialId = uidAccountMapRef.current[uid] ?? uid;
        setParticipants(prev => {
          if (prev.some(p => p.id === initialId)) return prev;
          return [...prev, { id: initialId, name: `User ${uid}`, isMuted: false }];
        });

        // 非同期で表示名を取得してから更新する（即時更新だと名前が空のままになる）
        (async () => {
          try {
            const accountOrUid = uidAccountMapRef.current[uid] ?? uid;
            const displayName = await getDisplayName(accountOrUid);
            if (!displayName) return;

            // account をキーにして名前を更新
            setParticipants(prev =>
              prev.map(p => (p.id === accountOrUid ? { ...p, name: displayName } : p))
            );

            // もし最初に uidStr で追加していて account が別なら id も置き換える
            if (accountOrUid !== uid) {
              setParticipants(prev =>
                prev.map(p => (p.id === uid ? { ...p, id: accountOrUid, name: displayName } : p))
              );
            }
          } catch (e) {
            console.warn('[Agora] getDisplayName error', e);
            crashlytics().recordError(e as Error);
          }

          try {
            const info = engine.getUserInfoByUid?.(remoteUid);
            console.log('[Agora] getUserInfoByUid ->', info);
          } catch (e) {
            console.log('[Agora] getUserInfoByUid error', e);
            crashlytics().recordError(e as Error);
          }
        })();
      },
      onUserInfoUpdated(uidMaybe: any, userInfoMaybe: any) {
        const rawArgs = arguments as IArguments;
        let uid = uidMaybe;
        let userInfo = userInfoMaybe;

        if (
          uidMaybe &&
          typeof uidMaybe === 'object' &&
          uidMaybe !== null &&
          typeof userInfoMaybe === 'number'
        ) {
          uid = userInfoMaybe;
          userInfo = rawArgs[2];
        }

        console.log('[Agora] onUserInfoUpdated', uid, userInfo);
        const account = userInfo?.userAccount;
        const uidStr = String(uid);

        if (account) {
          uidAccountMapRef.current[uidStr] = account;

          setParticipants(prev => {
            if (prev.some(p => p.id === account)) {
              return prev.filter(p => p.id !== uidStr);
            }
            return prev.map(p => (p.id === uidStr ? { ...p, id: account } : p));
          });

          getDisplayName(account).catch(() => {});
        } else {
          getDisplayName(uidStr).catch(() => {});
        }
      },
      onUserOffline: (_connection, remoteUid) => {
        console.log('[Agora] remote offline', remoteUid);
        const acct = uidAccountMapRef.current[String(remoteUid)];
        setParticipants(prev =>
          prev.filter(p => p.id !== (acct ?? String(remoteUid)))
        );
      },
      onUserMuteAudio: (_connection, remoteUid, muted) => {
        console.log('[Agora] remote mute change', remoteUid, muted);
        const acct = uidAccountMapRef.current[String(remoteUid)];
        const targetId = acct ?? String(remoteUid);
        setParticipants(prev =>
          prev.map(p =>
            p.id === targetId ? { ...p, isMuted: !!muted } : p
          )
        );
      },
      onAudioVolumeIndication: (_connection, speakers) => {
        const localId = localUserIdRef.current ?? (agoraUid != null ? String(agoraUid) : 'local');
        setParticipants(prev =>
          prev.map(p => {
            const hit = speakers.find(s => {
              if (s.uid === 0) return p.id === localId;
              const mapped = uidAccountMapRef.current[String(s.uid)] ?? String(s.uid);
              return p.id === mapped;
            });
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
  }, [AGORA_APP_ID, getDisplayName]);

  useEffect(() => {
    console.log('[Reaction] Start listening');

    const reactionsRef = collection(db, 'rooms', String(roomId), 'reactions');
    const q = query(reactionsRef, orderBy('createdAt', 'desc'), limit(1));
    // 最新のリアクションを監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot?.docChanges().forEach((change: any) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // サーバー時刻がない場合(ローカル書き込み直後)は現在時刻扱い
            const createdAt = data.createdAt?.toMillis?.() ?? Date.now();
            
            // 10秒以内の新しいリアクションだけ反応する（過去ログ無視）
            if (Date.now() - createdAt < 10000) {
               console.log('[Reaction Received]', data.emoji, 'from', data.senderName);
               // ★修正: senderId も渡すようにする（data.senderId は addDoc で入れてるはず）
               // senderId が数値の場合もあるので String() で変換しておく
               ShowReaction(data.emoji, String(data.senderId));
            }
          }
        });
      });

    return () => unsubscribe();
  }, [roomId, db]);

  // ★実装: リアクションを表示して、3秒後に消す
  const ShowReaction = (emoji: string, senderId: string) => {
    // Stateを更新して表示させる
    setActiveReactions(prev => ({
      ...prev,
      [senderId]: emoji
    }));

    // 3秒後に消すタイマー
    setTimeout(() => {
      setActiveReactions(prev => {
        const next = { ...prev };
        delete next[senderId]; // キーを削除して非表示に
        return next;
      });
    }, 3000);
  }

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
      console.error('Error renewing token:', error);
      crashlytics().recordError(error as Error);
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
      const currentUser = auth.currentUser;
      const userAccountParam = currentUser ? encodeURIComponent(currentUser.uid) : '';
      const tokenUrl =
        `https://api.tsuuwa.com/rooms/${roomId}/token${userAccountParam ? `?userAccount=${userAccountParam}` : ''}`;
      const res = await fetch(tokenUrl);
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

      // サーバーがuidを返さなくても、手元のFirebase UIDをuserAccountとして使う
      if (!nextAccount && currentUser?.uid) {
        nextAccount = currentUser.uid;
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
          console.log('[Agora] registerLocalUserAccount ->', registerCode);
          if (registerCode !== 0) {
            throw new Error(`registerLocalUserAccount failed (${registerCode})`);
          }
          joinCode = engineRef.current.joinChannelWithUserAccount(
            data.token,
            channelId,
            nextAccount,
            options,
          );
          console.log('[Agora] joinChannelWithUserAccount ->', joinCode);

          if (joinCode === -2 && /^\d+$/.test(nextAccount)) {
            // ありえないけど数値っぽい文字列ならフォールバック
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
          console.log('[Agora] joinChannel (uid) ->', joinCode);
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
      crashlytics().recordError(e as Error);
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

  // ユーザーIDを変更して再参加するヘルパー
  const switchAgoraId = async (newId: string | number) => {
    if (!engineRef.current) return;
    // 既に入ってたら退出
    if (joinedRef.current) {
      try { engineRef.current.leaveChannel(); } catch {}
      joinedRef.current = false;
    }

    // numeric uid で参加する場合
    if (typeof newId === 'number') {
      if (!agoraToken) {
        console.error('Agora token is null. Cannot join channel.');
        return;
      }
      const joinCode = engineRef.current.joinChannel(agoraToken, String(roomId), newId, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      if (joinCode === 0) {
        localUserIdRef.current = String(newId);
        setAgoraUid(newId);
        joinedRef.current = true;
      }
      return;
    }

    // userAccount（文字列）で参加する場合
    const account = String(newId);
    const reg = engineRef.current.registerLocalUserAccount(AGORA_APP_ID!, account);
    if (reg !== 0) {
      console.warn('registerLocalUserAccount failed', reg);
      return;
    }
    if (!agoraToken) {
      console.error('Agora token is null. Cannot join channel.');
      return;
    }
    const joinCode = engineRef.current.joinChannelWithUserAccount(agoraToken, String(roomId), account, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    if (joinCode === 0) {
      localUserIdRef.current = account;
      setAgoraUserAccount(account);
      joinedRef.current = true;
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
    // 部屋に誰もいなくなったら削除リクエストを送る
    if(participants.length == 1) {
      fetch(`https://api.tsuuwa.com/rooms/${roomId}`, {
        method: 'DELETE',
      }).then(res => {
        if (res.ok) {
          console.log('Room deleted successfully');
        } else {
          console.warn('Failed to delete room:', res.status);
        }
      }).catch(err => {
        console.error('Error deleting room:', err);
      });
    }
    setParticipants([]);
  };



  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* 本文 */}
      <Box bg={headerBg} px={4} py={3} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            {name || `Room ${roomId}`}
          </Text>
          <HStack space={2} alignItems="center">
            <Badge bg="primary.500" _text={{ color: 'white' }} rounded="full" >
              <Text fontSize="sm">参加者 {participants.length} 人</Text>
            </Badge>
          </HStack>
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
            renderItem={({ item: participant, index }) => {
              // ★追加: 自分かどうか判定
              const isMe = participant.id === localUserIdRef.current;

              return (
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
                  position="relative"
                >
                  <Box bg="black">
                    <Center flex={1} bg="gray.600" py={8}>
                      <VStack space={2} alignItems="center">
                        <Avatar size="lg" bg="blue.500" />
                        <Text color="white" fontSize="md">
                          {participant.name}
                        </Text>
                      </VStack>
                    </Center>
                  </Box>

                  {/* ★条件分岐: 自分じゃないときだけメニュー表示 */}
                  {!isMe && (
                    <Menu
                      trigger={(triggerProps) => (
                        <IconButton
                          {...triggerProps}
                          position="absolute"
                          top={2}
                          right={2}
                          zIndex={20}
                          size="sm"
                          bg="white"
                          _pressed={{ bg: 'gray.200' }}
                          rounded="full"
                          icon={
                            <Icon
                              as={Ionicons}
                              name="ellipsis-horizontal"
                              size="sm"
                              color="black"
                            />
                          }
                        />
                      )}
                      placement="left top"
                    >
                      <Menu.Item onPress={() => console.log('プロフィールを見る', participant.id)}>
                        プロフィールを見る
                      </Menu.Item>
                      <Menu.Item onPress={() => { 
                        console.log('通報する', participant.id); 
                        setIsOpenReportDialog(true); 
                        setReportedUserId(participant.id); 
                      }}>
                        通報する
                      </Menu.Item>
                    </Menu>
                  )}

                  {/* ミュートバッジとか下の名前エリア */}
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
              );
            }}
          />
      </Box>

      {/* フッター操作列 */}
      <Box bg={headerBg} p={4} shadow={2} position="relative">
        <HStack justifyContent="center" space={6}>
          {/* ミュート/退出ボタン */}
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

        {/* 透明ガラステイスト FAB */}
        <Fab
          position="absolute"
          bottom={REACTION_FAB_BOTTOM}
            right={REACTION_FAB_RIGHT}
          bg={useColorModeValue('rgba(255,255,255,0.55)', 'rgba(250,250,250,0.18)')}
          borderWidth={1}
          borderColor={useColorModeValue('rgba(255,255,255,0.25)', 'rgba(255,255,255,0.18)')}
          _pressed={{ bg: useColorModeValue('rgba(255,255,255,0.20)', 'rgba(0,0,0,0.35)') }}
          shadow={4}            // やや弱め
          icon={<Ionicons name="happy-outline" size={24} color={useColorModeValue('black', 'white')} />}
          onPress={() => setShowReaction(v => !v)}
        />
      </Box>

      {/* リアクショントレー: フッターの外に絶対配置して layout 干渉させない */}
      {showReaction && (
        <>
          {/* 全画面オーバーレイ (閉じる用) */}
          <Pressable
            position="absolute"
            top={0} left={0} right={0} bottom={0}
            onPress={() => setShowReaction(false)}
            bg="transparent"
            zIndex={40}
          />
          {/* ← PresenceTransition 自体が stretch しがちなので、絶対配置は外側の Box に持たせる */}
          <Box
            position="absolute"
            right={REACTION_FAB_RIGHT}
            bottom={REACTION_FAB_BOTTOM + FAB_SIZE + 26}
            zIndex={50}
            pointerEvents="box-none"
            alignItems="flex-end"
          >
            <PresenceTransition
              visible={showReaction}
              initial={{ opacity: 0, translateY: 8 }}
              animate={{
                opacity: 1,
                translateY: 0,
                transition: { duration: 160 },
              }}
            >
              <Box
                alignSelf="flex-end"   // これで横幅が content に収まる
                px={6}
                py={3}
                w="auto"
                flexShrink={1}
                //bg={useColorModeValue('rgba(30,30,30,0.55)', 'rgba(250,250,250,0.18)')}
                borderWidth={1}
                borderColor={useColorModeValue('rgba(255,255,255,0.28)', 'rgba(255,255,255,0.25)')}
                rounded="full"
                shadow={0}              // 影で巨大化見えするの防止
                pointerEvents="auto"
              >
                <HStack space={3} alignItems="center">
                  {reactionList.map((emoji) => (
                    <Pressable
                      key={emoji}
                      w={REACTION_ITEM_SIZE}
                      h={REACTION_ITEM_SIZE}
                      alignItems="center"
                      justifyContent="center"
                      rounded="full"
                      _pressed={{ bg: useColorModeValue('white:alpha.20', 'black:alpha.30') }}
                      hitSlop={8}
                      onPress={async () => {
                        console.log('Reaction:', emoji);
                        setShowReaction(false);
                        
                        // ↓↓↓ 修正: Firestoreに書き込み
                        try {
                          const myName = participants.find(p => p.id === localUserIdRef.current)?.name || 'Unknown';

                          const reactionsRef = collection(db, 'rooms', String(roomId), 'reactions');
                          await addDoc(reactionsRef, {
                            emoji,
                            senderId: localUserIdRef.current,
                            senderName: myName,
                            createdAt: serverTimestamp(),
                          });
                          console.log('[Reaction] Sent:', emoji);
                        } catch (e) {
                          console.warn('[Reaction] Send error:', e);
                        }
                      }}
                    >
                      <Text fontSize={REACTION_EMOJI_SIZE} lineHeight={REACTION_EMOJI_SIZE}>
                        {emoji}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </Box>
            </PresenceTransition>
          </Box>
        </>
      )}

      {/* 退出ダイアログ */}
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
      {/* 通報ダイアログ */}
      {isOpenReportDialog && (
        <ReportUserDialog
          isOpen={isOpenReportDialog}
          onClose={() => setIsOpenReportDialog(false)}
          reportedUserId={reportedUserId ?? ''} // ここに通報対象のユーザーIDを渡す
        />
      )}
    </Box>
  );
  
}
