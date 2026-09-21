import axios from "axios";

/**
 * Two clients:
 *  - `api`: plain instance for /auth/admin-login, /auth/refresh, /auth/me.
 *  - `createAdminApi(key)`: attaches the x-admin-key header required by
 *    every /api/admin/* route, on top of the normal JWT.
 *
 * Access token lives in memory; refresh token lives in an httpOnly cookie
 * sent automatically (requires the backend's CORS to allow this app's
 * origin with credentials -- see server CLIENT_URL).
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

/** Admin-gated instance. Throws rather than silently using a fallback key. */
export function createAdminApi(adminKey) {
  if (!adminKey) throw new Error("createAdminApi requires a real admin key -- never falls back to a default.");
  const instance = axios.create({ baseURL: "/api/admin", withCredentials: true });
  instance.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["x-admin-key"] = adminKey;
    return config;
  });
  return instance;
}
