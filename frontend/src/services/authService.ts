import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, deleteDoc } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppleFirebaseCredential } from './appleAuth';

// アプリインスタンスを取得 (モジュール式)
const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Google Sign-Inの設定
GoogleSignin.configure({
  webClientId: '890979401267-9hfchfep2kvkcp2mf5jhvcj24matq5ea.apps.googleusercontent.com', 
  offlineAccess: true,
  hostedDomain: '', // オプション
  forceCodeForRefreshToken: true, // オプション
});

// プロフィールのリロードを行う関数
type ProfileFallback = {
  displayName?: string | null;
  email?: string | null;
};

export async function reloadUserProfile(fallback: ProfileFallback = {}) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await user.reload();
    const u = auth.currentUser;
    if (!u) return;

    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    const existing = snap.data() ?? {};

    const nextDisplayName = buildDisplayName(
      u.uid,
      fallback.email || u.email || existing.email || null,
      fallback.displayName || u.displayName || existing.displayName || null
    );

    const payload = {
      uid: u.uid,
      email: fallback.email || u.email || existing.email || null,
      displayName: nextDisplayName,
      photoURL: u.photoURL || existing.photoURL || '',
      updatedAt: serverTimestamp(),
    };

    await setDoc(
      userRef,
      payload,
      { merge: true }
    );
  } catch (e) {
    console.warn('Failed to reload user profile', e);
  }
}

// 認証状態の変更を監視し、Zustandストアを更新（モジュール式 onAuthStateChanged を使用）
export function initializeAuthObserver() {
  const { useAuthStore } = require('../store/authStore');
  const { setUser, setInitializing } = useAuthStore.getState();

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setUser(null);
      if (useAuthStore.getState().isInitializing) {
        setInitializing(false);
      }
      return;
    }

    // ★削除: reload() は呼ばない（無限ループ防止）
    // reload() はログイン時に login.tsx で呼ぶ

    setUser(user);
    if (useAuthStore.getState().isInitializing) {
      setInitializing(false);
    }

    // Firestore への同期は既存データとマージ
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const existing = userDoc.data() ?? {};

    const nextDisplayName = buildDisplayName(
      user.uid,
      user.email || existing.email || null,
      user.displayName || existing.displayName || null
    );

    const payload = {
      uid: user.uid,
      email: user.email || existing.email || null,
      displayName: nextDisplayName,
      photoURL: user.photoURL || existing.photoURL || '',
      updatedAt: serverTimestamp(),
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, { ...payload, createdAt: serverTimestamp() });
    } else {
      await setDoc(userRef, payload, { merge: true });
    }
  });
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();

  // Googleアカウント選択
  await GoogleSignin.signIn();

  // idTokenは getTokens から取るとバージョン差異に強い
  const { idToken } = await GoogleSignin.getTokens();

  if (!idToken) {
    throw new Error('Google idToken が取得できなかった');
  }

  const googleCredential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, googleCredential);
};

// ユーザーデータの完全削除（Firebase Authenticationのユーザー削除 + Firestoreのユーザードキュメント削除）
export async function deleteUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // 再認証（requires-recent-login 対策）
  const providerIds = (user.providerData || [])
    .map((p) => p?.providerId)
    .filter(Boolean);

  if (providerIds.includes('apple.com')) {
    const { firebaseCredential } = await createAppleFirebaseCredential({
      requestScopes: false,
    });
    await user.reauthenticateWithCredential(firebaseCredential);
  } else if (providerIds.includes('google.com')) {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();
    if (!idToken) throw new Error('Google idToken の取得に失敗');
    const googleCredential = GoogleAuthProvider.credential(idToken);
    await user.reauthenticateWithCredential(googleCredential);
  } else {
    throw new Error('未対応の認証プロバイダです');
  }

  // Firestoreのユーザードキュメント削除
  const userRef = doc(db, 'users', user.uid);
  await deleteDoc(userRef);

  // Firebase Authenticationのユーザー削除
  await user.delete();

  // Zustandのstoreをリセット
  const { useAuthStore } = require('../store/authStore');
  useAuthStore.getState().setUser(null);

  // AsyncStorageのToS/Privacy同意フラグもリセット
  await AsyncStorage.removeItem('acceptedToS');
  await AsyncStorage.removeItem('acceptedPrivacy');
}

function buildDisplayName(uid: string, email?: string | null, current?: string | null) {
  // 既存が有効なら優先（"名無し" はプレースホルダ扱い）
  if (current && current !== '名無し') return current;

  if (email) {
    const local = email.split('@')[0]?.trim();
    if (local) return local;
  }

  return `user_${uid.slice(0, 6)}`;
}
