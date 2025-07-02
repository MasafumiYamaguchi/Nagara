import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuthStore } from '../store/authStore';

// 認証状態の変更を監視し、Zustandストアを更新します。
// この関数はアプリの起動時に一度だけ呼び出す必要があります（例: _layout.tsx）。
export function initializeAuthObserver() {
  const { setUser, setInitializing } = useAuthStore.getState();
  return auth().onAuthStateChanged((user) => {
    setUser(user);
    if (useAuthStore.getState().isInitializing) {
      setInitializing(false);
    }
  });
}

export async function signUp(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
  return await auth().createUserWithEmailAndPassword(email, password);
}

export async function signIn(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
  return await auth().signInWithEmailAndPassword(email, password);
}

export async function signOut(): Promise<void> {
  return await auth().signOut();
}