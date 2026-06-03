import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,       // { id, name, username, avatar, college, verified, ... }
      token: null,

      setAuth: (user, token) => set({ user, token }),
      updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' } // persisted to localStorage
  )
);

export default useAuthStore;
