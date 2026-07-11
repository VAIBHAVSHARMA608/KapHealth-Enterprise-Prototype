import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, setUnauthorizedHandler } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    // Try a silent refresh on first load in case a valid refresh cookie exists
    (async () => {
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
    })();
  }, []);

  const loginWithToken = useCallback(async (accessToken, userPayload) => {
    setAccessToken(accessToken);
    setUser(userPayload);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
