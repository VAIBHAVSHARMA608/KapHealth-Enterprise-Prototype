import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { createAdminApi } from "../services/api.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminKey, setAdminKey] = useState(null);
  const [adminApi, setAdminApi] = useState(null);
  const [loading, setLoading] = useState(false);

  function loginAdmin(user, key) {
    setLoading(true);

    setAdminUser(user);
    setAdminKey(key);
    setAdminApi(createAdminApi(key));

    setLoading(false);
  }

  function logoutAdmin() {
    setLoading(true);

    setAdminUser(null);
    setAdminKey(null);
    setAdminApi(null);

    setLoading(false);
  }

  const value = useMemo(
    () => ({
      adminUser,
      adminKey,
      adminApi,
      loading,
      loginAdmin,
      logoutAdmin,
    }),
    [adminUser, adminKey, adminApi, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    );
  }

  return context;
}