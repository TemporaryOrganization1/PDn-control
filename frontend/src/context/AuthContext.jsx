import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe, refreshTokens } from '../api';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedAccess && storedRefresh && storedUser) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser(JSON.parse(storedUser));

      // Validate token by fetching /me
      getMe(storedAccess)
        .then((userData) => {
          setUser(userData);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        })
        .catch(() => {
          // Token expired — try to refresh
          if (storedRefresh) {
            refreshTokens(storedRefresh)
              .then((tokens) => {
                setAccessToken(tokens.access_token);
                setRefreshToken(tokens.refresh_token);
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
                // Fetch user data with new token
                return getMe(tokens.access_token);
              })
              .then((userData) => {
                setUser(userData);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
              })
              .catch(() => {
                // Both tokens invalid — logout
                clearAuth();
              });
          } else {
            clearAuth();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const login = useCallback(async (email, password) => {
    const tokens = await apiLogin(email, password);
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

    const userData = await getMe(tokens.access_token);
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return userData;
  }, []);

  const logout = useCallback(async () => {
    // Try to invalidate refresh token on server (best-effort)
    if (refreshToken) {
      try {
        await fetch('http://localhost:8081/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Ignore errors
      }
    }
    clearAuth();
  }, [accessToken, refreshToken, clearAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuth: !!accessToken,
      loading,
      login,
      logout,
      guestCheckCount: parseInt(localStorage.getItem('guest_check_count') || '0', 10),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);