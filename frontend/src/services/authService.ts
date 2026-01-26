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
  webClientId: '890979401267-19vnobecq615sns2km9gebfdguhs7p2c.apps.googleusercontent.com', // 環境変数に置き換えた方がいい
  offlineAccess: true,
  hostedDomain: '', // オプション
  forceCodeForRefreshToken: true, // オプション
});

// 認証状態の変更を監視し、Zustandストアを更新（モジュール式 onAuthStateChanged を使用）
export function initializeAuthObserver() {
  // useAuthStore を遅延読み込みして循環参照対策
  const { useAuthStore } = require('../store/authStore');
  const { setUser, setInitializing } = useAuthStore.getState();

  return onAuthStateChanged(auth, async (user) => {
    // サインアウト時(user === null)は早期リターンしてFirestore操作を避ける
    if (!user) {
      setUser(null);
      if (useAuthStore.getState().isInitializing) {
        setInitializing(false);
      }
      return;
    }

    setUser(user);
    if (useAuthStore.getState().isInitializing) {
      setInitializing(false);
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '名無し',
        createdAt: serverTimestamp(),
      });
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