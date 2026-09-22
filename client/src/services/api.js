import axios from "axios";

/**
 * Shared axios instance. Access token lives in memory (via AuthContext),
 * refresh token lives in an httpOnly cookie the browser sends automatically.
 * On a 401 we try one silent refresh before giving up, so short-lived access
 * tokens don't force the user to re-login constantly.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

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
    const requestPath = original?.url || "";
    const isAuthRequest = requestPath.includes("/auth/");
    if (error.response?.status === 401 && !isAuthRequest && !original._retried) {
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
  if (!adminKey) throw new Error("createAdminApi requires an admin key.");
  const instance = axios.create({ baseURL: `${API_BASE_URL}/admin`, withCredentials: true });
  instance.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["x-admin-key"] = adminKey;
    return config;
  });
  return instance;
}
