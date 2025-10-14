import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

// アプリインスタンスを取得
const app = getApp();

// Google Sign-Inの設定
GoogleSignin.configure({
  webClientId: '890979401267-19vnobecq615sns2km9gebfdguhs7p2c.apps.googleusercontent.com', // 環境変数に変更！！！
  offlineAccess: true,
  hostedDomain: '', // オプション
  forceCodeForRefreshToken: true, // オプション
});

// 認証状態の変更を監視し、Zustandストアを更新
export function initializeAuthObserver() {
  const { setUser, setInitializing } = useAuthStore.getState();
  // appを明示的に渡す
  return auth(app).onAuthStateChanged(async (user) => {
    setUser(user);
    if (useAuthStore.getState().isInitializing) {
      setInitializing(false);
    }
    var userDoc = await firestore().collection('users').doc(user?.uid).get();
    if (!userDoc.exists) {
      // ユーザードキュメントが存在しない場合、新規作成
      await firestore().collection('users').doc(user?.uid).set({
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName || '名無し',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  });
}

export async function signUp(email: string, password: string) {
  // appを明示的に渡す
  return await auth(app).createUserWithEmailAndPassword(email, password);
}

export async function signIn(email: string, password: string) {
  // appを明示的に渡す
  return await auth(app).signInWithEmailAndPassword(email, password);
}

export async function signOut() {
  // appを明示的に渡す
  return await auth(app).signOut();
}

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const  { idToken } = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    throw error;
  }
}

// インポートを一番下に移動して循環参照を防ぐ
import { useAuthStore } from '../store/authStore';