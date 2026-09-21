import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  Mail,
  KeyRound,
} from "lucide-react";

import api, { setAccessToken } from "../services/api.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showKey, setShowKey] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post(
        "/auth/admin-login",
        {
          email,
          password,
        }
      );

      const adminKey = key.trim();

      setAccessToken(data.accessToken);

      loginAdmin(data.user, adminKey);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid Credentials"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 p-6">

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Left */}

        <div className="hidden flex-col justify-center bg-gradient-to-br from-emerald-600 to-teal-500 p-12 text-white lg:flex">

          <ShieldAlert size={70} />

          <h1 className="mt-8 text-4xl font-bold">
            KapHealth Admin
          </h1>

          <p className="mt-4 text-lg leading-8 text-white/85">
            Secure operations dashboard for
            managing doctors, appointments,
            complaints and platform settings.
          </p>

          <div className="mt-10 rounded-2xl bg-white/10 p-5 backdrop-blur">

            <p className="font-semibold">
               Protected Access
            </p>

            <p className="mt-2 text-sm text-white/80">
              Only authorized administrators
              can access this console.
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center justify-center p-8 lg:p-12">

          <form
            onSubmit={submit}
            className="w-full max-w-md"
          >

            <div className="mb-8 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">

                <ShieldAlert size={32} />

              </div>

              <h2 className="mt-5 text-3xl font-bold text-slate-800">
                Admin Login
              </h2>

              <p className="mt-2 text-slate-500">
                Enter your credentials
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <div className="mb-5 flex items-center rounded-xl border px-4">

              <Mail
                size={18}
                className="text-slate-400"
              />

              <input
                type="email"
                className="w-full border-none bg-transparent p-3 outline-none"
                placeholder="admin@kaphealth.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            {/* Password */}

            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="mb-5 flex items-center rounded-xl border px-4">

              <Lock
                size={18}
                className="text-slate-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="w-full border-none bg-transparent p-3 outline-none"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Admin Key */}

            <label className="mb-2 block text-sm font-medium">
              Admin Access Key
            </label>

            <div className="mb-8 flex items-center rounded-xl border px-4">

              <KeyRound
                size={18}
                className="text-slate-400"
              />

              <input
                type={
                  showKey
                    ? "text"
                    : "password"
                }
                className="w-full border-none bg-transparent p-3 outline-none"
                value={key}
                onChange={(e) =>
                  setKey(e.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowKey(!showKey)
                }
              >
                {showKey ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
            >
              {loading
                ? "Signing In..."
                : "Enter Admin Console"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}