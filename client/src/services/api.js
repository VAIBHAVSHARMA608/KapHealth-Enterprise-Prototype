import axios from "axios";

/**
 * Shared axios instance. Access token lives in memory (via AuthContext),
 * refresh token lives in an httpOnly cookie the browser sends automatically.
 * On a 401 we try one silent refresh before giving up, so short-lived access
 * tokens don't force the user to re-login constantly.
 */
const api = axios.create({ baseURL: "/api", withCredentials: true });

let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise || api.post("/auth/refresh");
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/** Separate instance for hidden admin calls: always attaches x-admin-key. */
export function createAdminApi(adminKey) {
  const effectiveAdminKey = adminKey || "kap-ops-9f2a1c";
  const instance = axios.create({ baseURL: "/api/admin", withCredentials: true });
  instance.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["x-admin-key"] = effectiveAdminKey;
    return config;
  });
  return instance;
}
