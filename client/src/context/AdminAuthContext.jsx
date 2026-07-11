import { createContext, useContext, useState } from "react";
import { createAdminApi } from "../services/api.js";

/**
 * Deliberately separate from the normal AuthContext. Holds BOTH the admin
 * JWT (via the shared api.js access-token slot, same as everyone else) AND
 * the x-admin-key secret, which only the site owner should ever have.
 * Nothing here is persisted to localStorage -- refreshing requires logging
 * in again, which is intentional for this surface.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminKey, setAdminKey] = useState(null);
  const [adminApi, setAdminApi] = useState(null);

  function loginAdmin(user, key) {
    setAdminUser(user);
    setAdminKey(key);
    setAdminApi(createAdminApi(key));
  }

  function logoutAdmin() {
    setAdminUser(null);
    setAdminKey(null);
    setAdminApi(null);
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminKey, adminApi, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
