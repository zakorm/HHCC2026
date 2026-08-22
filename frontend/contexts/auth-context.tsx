import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import * as api from '@/utils/api';

type AuthState = {
  user: api.ApiUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<api.ApiUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      login: async (email: string, password: string) => {
        const response = await api.login(email, password);
        setToken(response.access_token);
        setUser(response.user);
        return response.user;
      },
      logout: () => {
        if (token) {
          api.logout(token).catch(() => {});
        }
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
