// 認証状態の変更を監視し、Zustandストアを更新（モジュール式 onAuthStateChanged を使用）
export function initializeAuthObserver() {
  // useAuthStore を遅延読み込みして循環参照対策
  const { useAuthStore } = require('../store/authStore');
  const { setUser, setInitializing } = useAuthStore.getState();

  setInitializing(false);

  return () => {};
}

export async function signOut() {
  const { useAuthStore } = require('../store/authStore');
  useAuthStore.getState().setUser(null);
  return Promise.resolve();
}

export const signInWithGoogle = async () => {
  console.log('Mock signInWithGoogle called');
  
  const fakeUser = {
    uid: 'google-uid-12345',
    email: 'fakeuser@example.com',
    displayName: 'Fake User',
    photoURL: 'https://example.com/fakeuser.jpg',
    emailVerified: true,
    isAnonymous: false,
    metaData: {},
    providerData: [],
  };

  const { useAuthStore } = require('../store/authStore');
  useAuthStore.getState().setUser(fakeUser);
  if (useAuthStore.getState().isInitializing) {
    useAuthStore.getState().setInitializing(false);
  }

  return Promise.resolve();
}