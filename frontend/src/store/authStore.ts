import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

type AuthState = {
  user: FirebaseAuthTypes.User | null;
  isInitializing: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setInitializing: (isInitializing: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));