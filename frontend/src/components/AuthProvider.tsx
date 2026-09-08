'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  decodeEmail,
  getAccessToken,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  RegisterInput,
} from '@/lib/auth';
import { getMe, RoleName } from '@/lib/users';

interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** Роль текущего пользователя — известна только после отдельного запроса
   *  к GET /users/me (в JWT её нет). null, пока не подгрузилась/для гостя. */
  role: RoleName | null;
  /** true, пока идёт (пере)запрос роли — используется AdminGuard, чтобы не
   *  мигать "недостаточно прав" на долю секунды перед тем, как роль придёт. */
  roleLoading: boolean;
  /** ADMIN или MANAGER — те, кому по бизнес-правилам можно управлять каталогом. */
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleName | null>(null);
  // true по умолчанию: до первой проверки роли AdminGuard не должен решить,
  // что прав нет — иначе на долю секунды мелькнёт "недостаточно прав".
  const [roleLoading, setRoleLoading] = useState(true);

  const loadRole = useCallback(async () => {
    setRoleLoading(true);
    try {
      const me = await getMe();
      setRole(me.role);
    } catch {
      // Не авторизован / токен истёк — считаем, что прав нет, без падения UI.
      setRole(null);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const currentEmail = token ? decodeEmail(token) : null;
    setEmail(currentEmail);
    setLoading(false);
    if (currentEmail) {
      loadRole();
    } else {
      setRoleLoading(false);
    }
  }, [loadRole]);

  const login = useCallback(
    async (emailInput: string, password: string) => {
      const tokens = await loginRequest(emailInput, password);
      setEmail(decodeEmail(tokens.accessToken));
      await loadRole();
    },
    [loadRole],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const tokens = await registerRequest(input);
      setEmail(decodeEmail(tokens.accessToken));
      await loadRole();
    },
    [loadRole],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setEmail(null);
    setRole(null);
  }, []);

  const isStaff = role === 'ADMIN' || role === 'MANAGER';

  return (
    <AuthContext.Provider
      value={{
        email,
        isAuthenticated: !!email,
        loading,
        role,
        roleLoading,
        isStaff,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return ctx;
}
