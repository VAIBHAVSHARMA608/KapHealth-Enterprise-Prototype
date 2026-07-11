import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { MessageCircle, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import Logo from "../../components/Logo.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Single login surface for BOTH patients and doctors, but with distinct
 * onboarding outcomes: a brand-new phone/Google account picking "doctor"
 * lands on the doctor onboarding form; picking "patient" lands on a light
 * vitals form, then straight into browsing doctors.
 */
export default function Login() {
  const [role, setRole] = useState("patient");
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function postLoginRedirect(user, isNewUser) {
    const from = location.state?.from?.pathname;
    if (isNewUser && user.role === "doctor") return navigate("/doctor/onboarding");
    if (isNewUser && user.role === "patient") return navigate("/patient/onboarding");
    navigate(from || (user.role === "doctor" ? "/doctor/dashboard" : "/patient/doctors"));
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/otp/request", { phone, purpose: "login", role });
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send OTP, check the number and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { phone, code, name, role });
      await loginWithToken(data.accessToken, data.user);
      postLoginRedirect(data.user, data.isNewUser);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect code, try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    try {
      const { data } = await api.post("/auth/google", { idToken: credentialResponse.credential, role });
      await loginWithToken(data.accessToken, data.user);
      postLoginRedirect(data.user, data.isNewUser);
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed.");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <Logo className="mb-8" />
        <div className="card w-full p-8">
          <h1 className="font-display text-2xl font-medium">Log in to KapHealth</h1>
          <p className="mt-1 text-sm text-muted">Choose how you'll use KapHealth, then continue.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-black/5 p-1">
            {["patient", "doctor"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-full py-2 text-sm font-semibold capitalize transition ${
                  role === r ? "bg-white text-primary shadow-sm" : "text-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {step === "phone" && (
            <form onSubmit={requestOtp} className="mt-6 space-y-4">
              {role === "doctor" && (
                <div>
                  <label className="label">Full name</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Aditi Sharma" required />
                </div>
              )}
              <div>
                <label className="label">WhatsApp number</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  required
                />
              </div>
              <button disabled={loading} className="btn-primary w-full">
                <MessageCircle size={16} /> {loading ? "Sending..." : "Send OTP via WhatsApp"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="mt-6 space-y-4">
              <p className="text-sm text-muted">Enter the 6-digit code sent to <span className="font-medium text-ink">{phone}</span> on WhatsApp.</p>
              <input
                className="input text-center font-mono text-lg tracking-[0.4em]"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
              />
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Verifying..." : "Verify & continue"} <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => setStep("phone")} className="btn-ghost w-full">
                Use a different number
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google sign-in failed.")} />
          </div>
        </div>
      </div>
    </div>
  );
}
