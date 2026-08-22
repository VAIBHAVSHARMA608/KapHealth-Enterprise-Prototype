import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import api, {
  setAccessToken,
  setUnauthorizedHandler,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    }

    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
    });

    async function restoreSession() {
      try {
        const { data } = await api.post("/auth/refresh");

        setAccessToken(data.accessToken);

        const me = await api.get("/auth/me");

        setUser(me.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const loginWithToken = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithToken,
      logout,
      setUser,
    }),
    [user, loading, loginWithToken, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}