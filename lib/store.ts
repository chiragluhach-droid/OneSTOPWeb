import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  admin: Admin | null;
  token: string | null;
  _hydrated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  clearAuth: () => void;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      _hydrated: false,
      setAuth: (admin, token) => set({ admin, token }),
      clearAuth: () => set({ admin: null, token: null }),
      setHydrated: (v) => set({ _hydrated: v }),
    }),
    {
      name: 'onestop-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, admin: state.admin }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
