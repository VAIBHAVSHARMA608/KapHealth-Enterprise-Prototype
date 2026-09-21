import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api, { createAdminApi, setAccessToken, setUnauthorizedHandler } from "../services/api.js";

const AdminAuthContext = createContext(null);
const SESSION_KEY = "kap_admin_key"; // sessionStorage: cleared when the tab closes

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminKey, setAdminKey] = useState(null);
  const [adminApi, setAdminApi] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial session-restore attempt finishes

  function loginAdmin(user, key) {
    setAdminUser(user);
    setAdminKey(key);
    setAdminApi(createAdminApi(key));
    sessionStorage.setItem(SESSION_KEY, key);
  }

  function logoutAdmin() {
    setAdminUser(null);
    setAdminKey(null);
    setAdminApi(null);
    sessionStorage.removeItem(SESSION_KEY);
    setAccessToken(null);
    api.post("/auth/logout").catch(() => {});
  }

  // On first mount, try to silently restore a session: the refresh-token
  // cookie (httpOnly) may still be valid even though in-memory state reset
  // on reload. Only the admin key persists (sessionStorage, not
  // localStorage, so it doesn't linger after the tab closes).
  useEffect(() => {
    const savedKey = sessionStorage.getItem(SESSION_KEY);
    if (!savedKey) {
      setLoading(false);
      return;
    }

    setUnauthorizedHandler(() => logoutAdmin());

    api
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return api.get("/auth/me");
      })
      .then(({ data }) => {
        if (data.user?.role !== "admin") throw new Error("Not an admin session");
        setAdminUser(data.user);
        setAdminKey(savedKey);
        setAdminApi(createAdminApi(savedKey));
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ adminUser, adminKey, adminApi, loading, loginAdmin, logoutAdmin }),
    [adminUser, adminKey, adminApi, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
