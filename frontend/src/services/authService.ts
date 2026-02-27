import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

// アプリインスタンスを取得 (モジュール式)
const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Google Sign-Inの設定
GoogleSignin.configure({
  webClientId: '890979401267-19vnobecq615sns2km9gebfdguhs7p2c.apps.googleusercontent.com', 
  offlineAccess: true,
  hostedDomain: '', // オプション
  forceCodeForRefreshToken: true, // オプション
});

// プロフィールのリロードを行う関数
export async function reloadUserProfile() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await user.reload();
    const u = auth.currentUser;
    if (!u) return;

    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    const existing = snap.data() ?? {};

    await setDoc(userRef, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || existing.displayName || '名無し',
      photoURL: u.photoURL || existing.photoURL || '',
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    }, { merge: true });
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

    const payload = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '名無し',
      photoURL: user.photoURL || '',
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
  const { idToken } = await GoogleSignin.signIn();

  const googleCredential = GoogleAuthProvider.credential(idToken);

  return signInWithCredential(auth, googleCredential);
  
}
