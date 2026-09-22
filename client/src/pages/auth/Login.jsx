import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import Logo from "../../components/Logo.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const FloatingInput = ({
  id,
  label,
  value,
  icon,
  error = false,
  className = "",
  ...props
}) => {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div className={`group relative ${className}`}>
      <div
        className={[
          "relative flex h-14 items-end overflow-hidden rounded-2xl border bg-white/70",
          "transition-all duration-300 backdrop-blur-xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_4px_14px_rgba(15,23,42,.035)]",
          "focus-within:border-primary/60 focus-within:bg-white",
          "focus-within:shadow-[0_0_0_4px_rgba(15,110,91,.08),0_8px_22px_rgba(15,110,91,.08)]",
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,.08)]"
            : "border-slate-200/90",
        ].join(" ")}
      >
        <input
          id={id}
          value={value}
          placeholder=" "
          className="peer h-full w-full appearance-none bg-transparent px-4 pb-2.5 pt-5 pr-11 text-sm font-medium text-slate-900 outline-none placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />

        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2",
            "text-sm font-medium text-slate-400 transition-all duration-300",
            "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:scale-[0.78]",
            "peer-focus:font-semibold peer-focus:text-primary",
            hasValue
              ? "top-2.5 translate-y-0 scale-[0.78] font-semibold text-slate-500"
              : "",
          ].join(" ")}
        >
          {label}
        </label>

        {icon && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-primary">
            {icon}
          </span>
        )}

        <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-focus-within:w-[calc(100%-2rem)]" />
      </div>
    </div>
  );
};

const ROLE_CONTENT = {
  patient: {
    label: "Patient",
    short: "For patients",
    title: "Healthcare that",
    accent: "moves with you.",
    description:
      "Find trusted doctors, book consultations, manage prescriptions and keep your care journey organized.",
    icon: UserRound,
    points: [
      "Consult verified doctors",
      "Manage appointments",
      "Keep prescriptions in one place",
    ],
  },
  doctor: {
    label: "Doctor",
    short: "For clinicians",
    title: "A smarter way",
    accent: "to care.",
    description:
      "Run consultations, communicate with patients and manage your clinical workflow from one focused workspace.",
    icon: Stethoscope,
    points: [
      "Run secure consultations",
      "Manage your patient workflow",
      "Issue digital prescriptions",
    ],
  },
};

export default function Login() {
  const [role, setRole] = useState("patient");
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [testId, setTestId] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginWithToken, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const testLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_LOGIN === "true";

  const ADMIN_ROUTE_SECRET =
    import.meta.env.VITE_ADMIN_ROUTE_SECRET || "kap-ops-9f2a1c";

  const active = ROLE_CONTENT[role];
  const ActiveIcon = active.icon;

  function postLoginRedirect(currentUser, isNewUser) {
    const from = location.state?.from?.pathname;

    if (isNewUser && currentUser.role === "doctor") {
      return navigate("/doctor/onboarding");
    }

    if (isNewUser && currentUser.role === "patient") {
      return navigate("/patient/onboarding");
    }

    if (currentUser.role === "admin") {
      return navigate(`/${ADMIN_ROUTE_SECRET}/dashboard`, { replace: true });
    }

    navigate(
      from ||
        (currentUser.role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard"),
      { replace: true }
    );
  }

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        return navigate(`/${ADMIN_ROUTE_SECRET}/dashboard`, {
          replace: true,
        });
      }

      navigate(
        user.role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard",
        { replace: true }
      );
    }
  }, [user, authLoading, navigate, ADMIN_ROUTE_SECRET]);

  function selectRole(nextRole) {
    setRole(nextRole);
    setStep("phone");
    setCode("");
    setError("");
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const normalizedPhone = phone.trim().replace(/[\s()-]/g, "");
      const e164Phone = /^\d{10}$/.test(normalizedPhone)
        ? `+91${normalizedPhone}`
        : normalizedPhone;
      setPhone(e164Phone);
      await api.post("/auth/otp/request", {
        phone: e164Phone,
        purpose: "login",
        role,
      });
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message?.includes("E.164")
          ? "Enter a valid WhatsApp number, such as +919876543210."
          : err.response?.data?.message ||
          "Couldn't send the OTP. Check the number and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/otp/verify", {
        phone,
        code,
        name,
        role,
      });

      await loginWithToken(data.accessToken, data.user);
      postLoginRedirect(data.user, data.isNewUser);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "That verification code isn't valid. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setGoogleLoading(true);

    try {
      const { data } = await api.post("/auth/google", {
        idToken: credentialResponse.credential,
        role,
      });

      await loginWithToken(data.accessToken, data.user);
      postLoginRedirect(data.user, data.isNewUser);
    } catch (err) {
      setError(
        err.response?.data?.message || "Google sign-in failed."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  async function testLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/test-login", {
        identifier: testId,
        password: testPassword,
      });

      await loginWithToken(data.accessToken, data.user);
      postLoginRedirect(data.user, false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid test credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef5f1]">
      <Navbar />

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[36rem] w-[36rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <main className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-[1380px] items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 p-2 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:min-h-[700px] lg:grid-cols-[1.15fr_0.85fr]">

          {/* =========================================================
              LEFT: INTERACTIVE ROLE PANELS
             ========================================================= */}
          <section className="relative hidden min-h-[680px] overflow-hidden rounded-[1.6rem] bg-[#092f29] p-2 lg:flex">
            {/* Decorative atmosphere */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/[0.08] blur-3xl" />
              <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl" />
            </div>

            <div className="relative z-10 flex w-full flex-col">
              <div className="flex items-center justify-between px-5 py-4">
                <Logo className="[&_span]:!text-white" />

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 backdrop-blur-xl">
                  <ShieldCheck size={12} />
                  Secure platform
                </div>
              </div>

              <div className="px-5 pb-4 pt-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/50">
                  Choose your experience
                </p>
                <h1 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight text-white xl:text-4xl">
                  One platform.
                  <br />
                  <span className="text-emerald-200">
                    Two ways to care.
                  </span>
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
                  Select the workspace that fits you. The interface adapts
                  around your role, so you see what matters without the
                  dashboard clutter.
                </p>
              </div>

              {/* Uiverse-inspired expanding role panels */}
              <div className="mt-auto flex min-h-[330px] gap-2 p-2">
                {["patient", "doctor"].map((currentRole) => {
                  const item = ROLE_CONTENT[currentRole];
                  const Icon = item.icon;
                  const selected = role === currentRole;

                  return (
                    <button
                      key={currentRole}
                      type="button"
                      onClick={() => selectRole(currentRole)}
                      className={[
                        "group relative flex h-full min-w-0 flex-1 overflow-hidden rounded-xl border text-left",
                        "transition-[flex,background,border,transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60",
                        selected
                          ? "flex-[3.8] border-emerald-200/30 bg-gradient-to-br from-[#126c5b] to-[#0a4b41] shadow-2xl shadow-black/20"
                          : "flex-1 border-white/10 bg-white/[0.045] hover:bg-white/[0.08]",
                      ].join(" ")}
                    >
                      {/* Number */}
                      <span className="absolute right-4 top-4 text-[10px] font-bold tracking-[0.15em] text-white/20">
                        0{currentRole === "patient" ? "1" : "2"}
                      </span>

                      {/* Collapsed state */}
                      {!selected && (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/70 transition-transform duration-300 group-hover:scale-105">
                            <Icon size={19} strokeWidth={1.7} />
                          </div>

                          <span className="rotate-[-90deg] whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                            {item.label}
                          </span>
                        </div>
                      )}

                      {/* Expanded state */}
                      {selected && (
                        <div className="flex w-full flex-col justify-between p-6">
                          <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-100 shadow-lg backdrop-blur-xl">
                              <Icon size={21} strokeWidth={1.7} />
                            </div>

                            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/65">
                              {item.short}
                            </p>

                            <h2 className="mt-2 max-w-sm font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white">
                              {item.title}
                              <br />
                              <span className="text-emerald-200">
                                {item.accent}
                              </span>
                            </h2>

                            <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                              {item.description}
                            </p>

                            <div className="mt-6 space-y-2.5">
                              {item.points.map((point) => (
                                <div
                                  key={point}
                                  className="flex items-center gap-2.5 text-xs text-white/70"
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="shrink-0 text-emerald-200"
                                  />
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/35">
                            <Sparkles size={12} />
                            Selected workspace
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 px-5 py-4 text-[10px] font-medium text-white/30">
                <LockKeyhole size={12} />
                Your healthcare information stays protected.
              </div>
            </div>
          </section>

          {/* =========================================================
              RIGHT: LOGIN
             ========================================================= */}
          <section className="relative flex items-center bg-white/80 px-5 py-8 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-[420px]">
              {/* Mobile role selector */}
              <div className="mb-8 lg:hidden">
                <Logo />

                <div className="mt-7 flex gap-2 rounded-2xl bg-slate-100 p-1">
                  {["patient", "doctor"].map((currentRole) => {
                    const Icon = ROLE_CONTENT[currentRole].icon;

                    return (
                      <button
                        key={currentRole}
                        type="button"
                        onClick={() => selectRole(currentRole)}
                        className={[
                          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition",
                          role === currentRole
                            ? "bg-white text-primary shadow-sm"
                            : "text-muted",
                        ].join(" ")}
                      >
                        <Icon size={15} />
                        {ROLE_CONTENT[currentRole].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Heading */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Welcome back</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950">
                      Sign in to KapHealth
                    </h2>
                  </div>

                  <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.06] text-primary sm:flex">
                    <ActiveIcon size={19} strokeWidth={1.7} />
                  </div>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Continue as a{" "}
                  <span className="font-semibold text-primary">
                    {active.label.toLowerCase()}
                  </span>{" "}
                  to access your secure workspace.
                </p>
              </div>

              {/* Progress */}
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={[
                      "h-full rounded-full bg-primary transition-all duration-500",
                      step === "phone"
                        ? "w-1/2"
                        : step === "otp"
                          ? "w-full"
                          : "w-full",
                    ].join(" ")}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted">
                  {step === "phone"
                    ? "1 / 2"
                    : step === "otp"
                      ? "2 / 2"
                      : "DEV"}
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/80 px-3.5 py-3 text-sm text-red-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <p>{error}</p>
                </div>
              )}

              {/* PHONE */}
              {step === "phone" && (
                <form onSubmit={requestOtp} className="mt-6">
                  {role === "doctor" && (
                    <div className="mb-4">
                      <label className="label" htmlFor="doctor-name">
                        Full name
                      </label>
                      <FloatingInput
                        id="doctor-name"
                        label="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={<UserRound size={18} />}
                        placeholder="Dr. Aditi Sharma"
                        autoComplete="name"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="label" htmlFor="phone">
                      WhatsApp number
                    </label>
                    <FloatingInput
                      id="phone"
                      label="WhatsApp number"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d+]/g, "");
                        const digits = value.replace(/^\+/, "");
                        setPhone(digits.length === 10 ? `+91${digits}` : value);
                      }}
                      icon={<MessageCircle size={18} />}
                      placeholder="+91 98765 43210"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  {/* Neumorphic / Uiverse-inspired primary button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={[
                      "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full",
                      "border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100",
                      "font-semibold text-slate-700 text-sm shadow-[0_4px_3px_#fff,0_6px_10px_rgba(148,163,184,.35),0_-3px_4px_rgba(206,207,209,.7),inset_0_0_3px_2px_rgba(206,207,209,.8)]",
                      "transition-all duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_5px_4px_#fff,0_8px_14px_rgba(148,163,184,.42),0_-4px_5px_rgba(206,207,209,.65),inset_0_0_4px_3px_rgba(206,207,209,.8)]",
                      "active:translate-y-0 active:shadow-[inset_0_0_5px_3px_#999,inset_0_0_25px_#aaa]",
                      "disabled:pointer-events-none disabled:opacity-50",
                    ].join(" ")}
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
                        Sending secure code...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={17} className="text-primary" />
                        Continue with WhatsApp
                        <ArrowRight size={16} className="text-slate-400" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP */}
              {step === "otp" && (
                <form onSubmit={verifyOtp} className="mt-6">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary"
                  >
                    <ArrowLeft size={13} />
                    Change number
                  </button>

                  <div className="rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <MessageCircle size={16} />
                      </div>
                      <p className="text-xs leading-5 text-muted">
                        Verification code sent to{" "}
                        <span className="font-semibold text-ink">
                          {phone}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="label" htmlFor="otp">
                      6-digit verification code
                    </label>
                    <FloatingInput
                      id="otp"
                      label="Verification code"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="[&>div>input]:text-center [&>div>input]:font-mono [&>div>input]:text-xl [&>div>input]:tracking-[0.45em]"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || code.length !== 6}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,110,91,.22)] transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_12px_25px_rgba(15,110,91,.27)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & continue
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* DEV */}
              {testLoginEnabled && step === "test" && (
                <form onSubmit={testLogin} className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-xs leading-5 text-amber-800">
                      Local development mode. Test credentials bypass OTP.
                    </p>
                  </div>

                  <div>
                    <label className="label" htmlFor="test-id">
                      Email or phone
                    </label>
                    <FloatingInput
                      id="test-id"
                      label="Email or phone"
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      placeholder="patient1@kaptest.dev"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="test-password">
                      Password
                    </label>
                    <FloatingInput
                      id="test-password"
                      label="Password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? "Signing in..." : "Sign in"}
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="btn-ghost w-full"
                  >
                    Back to secure login
                  </button>
                </form>
              )}

              {/* DEV toggle */}
              {testLoginEnabled && step !== "test" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("test");
                    setError("");
                  }}
                  className="mt-4 w-full text-center text-[10px] font-medium text-muted transition hover:text-primary"
                >
                  Local development?{" "}
                  <span className="underline decoration-dotted underline-offset-2">
                    Use test credentials
                  </span>
                </button>
              )}

              {/* Google */}
              {step !== "test" && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-line" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Or
                    </span>
                    <div className="h-px flex-1 bg-line" />
                  </div>

                  <div className="relative flex justify-center">
                    {googleLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
                      </div>
                    )}

                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google sign-in failed.")}
                      useOneTap={false}
                      shape="pill"
                      size="large"
                      width="350"
                      text="continue_with"
                    />
                  </div>
                </>
              )}

              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-medium text-muted">
                <LockKeyhole size={12} className="text-primary" />
                Secure authentication
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <Check size={11} className="text-emerald-600" />
                Encrypted
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
