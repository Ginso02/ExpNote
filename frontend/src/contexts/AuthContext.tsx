import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/lib/auth";
import * as authApi from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getProfile();
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (loginId: string, password: string) => {
    const data = await authApi.login({ login_id: loginId, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setUser(data.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const data = await authApi.register({ username, email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使 API 失败也清除本地状态
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
