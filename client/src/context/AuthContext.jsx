import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi, clearCsrfToken, setCsrfToken } from "../services/api";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      const currentUser = response.data?.user || null;
      setUser(currentUser);
      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken);
      }
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    authApi
      .getMe()
      .then((response) => {
        if (!active) return;
        setUser(response.data?.user || null);
        if (response.data?.csrfToken) {
          setCsrfToken(response.data.csrfToken);
        }
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    const registeredUser = response.data?.user || null;
    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const login = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    const loggedInUser = response.data?.user || null;
    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearCsrfToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      register,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, register, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
