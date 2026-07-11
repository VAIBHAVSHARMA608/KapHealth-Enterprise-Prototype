import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import api from "../../services/api.js";
import { setAccessToken } from "../../services/api.js";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const ADMIN_ROUTE_SECRET = import.meta.env.VITE_ADMIN_ROUTE_SECRET || "kap-ops-9f2a1c";

/**
 * This page is never linked from anywhere in the public app. It only exists
 * at /{ADMIN_ROUTE_SECRET}/login. Even with the correct URL, logging in
 * still needs BOTH the owner's email/password (checked server-side against
 * the `admin` role) AND the ADMIN_ACCESS_KEY secret (checked on every
 * subsequent /api/admin/* call) -- see server/src/middleware/adminGate.js.
 */
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin-login", { email, password });
      setAccessToken(data.accessToken);
      loginAdmin(data.user, key);
      navigate(`/${ADMIN_ROUTE_SECRET}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-8">
        <div className="mb-6 flex items-center gap-2 text-primary"><ShieldAlert size={22} /><h1 className="font-display text-xl font-medium">Ops console</h1></div>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">Password</label>
        <input className="input mb-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label className="label">Admin access key</label>
        <input className="input mb-6" type="password" value={key} onChange={(e) => setKey(e.target.value)} required />
        <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Enter console"}</button>
      </form>
    </div>
  );
}
