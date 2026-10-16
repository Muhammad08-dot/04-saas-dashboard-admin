import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { setCurrentUser, type MockUser } from '@/lib/mock';

export type User = MockUser;

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginAs: (role: 'admin' | 'viewer') => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) { setLoading(false); return; }
    api.get<User>('/auth/me/')
      .then(setUser)
      .catch(() => { setCurrentUser(null); localStorage.removeItem(ACCESS_KEY); })
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string) {
    const data = await api.post<{ access: string; refresh: string; user: User }>('/auth/login/', { username, password });
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    setUser(data.user);
  }

  const loginAs = (role: 'admin' | 'viewer') =>
    login(role, role === 'admin' ? 'Admin@2025!' : 'Viewer@2025!');

  function logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setCurrentUser(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, loginAs, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  );
}
