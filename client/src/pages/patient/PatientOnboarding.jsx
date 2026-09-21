import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Droplets,
  HeartPulse,
  Height,
  Info,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
  Weight,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const SAMPLE_PROFILE = {
  dateOfBirth: "1992-05-10",
  gender: "female",
  bloodGroup: "A+",
  heightCm: "165",
  weightKg: "60",
  allergies: "None",
  chronicConditions: "Mild asthma",
};

const STEPS = [
  { number: "01", label: "Basics", icon: UserRound },
  { number: "02", label: "Vitals", icon: HeartPulse },
  { number: "03", label: "Care context", icon: ShieldCheck },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85";

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[10px] leading-4 text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function ProgressStep({ active, completed, number, label, Icon }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold transition-all duration-300",
          completed
            ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
            : active
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-slate-200 bg-white text-slate-300",
        ].join(" ")}
      >
        {completed ? <Check size={14} /> : <Icon size={15} />}
      </div>

      <div className="min-w-0">
        <p
          className={[
            "text-[9px] font-bold uppercase tracking-[.12em]",
            active || completed ? "text-slate-800" : "text-slate-400",
          ].join(" ")}
        >
          {number}
        </p>
        <p
          className={[
            "truncate text-[10px] font-semibold",
            active || completed ? "text-slate-700" : "text-slate-400",
          ].join(" ")}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function CompletionRing({ completion }) {
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (completion / 100) * circumference;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,.16)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-slate-900">
          {completion}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[.1em] text-slate-400">
          %
        </span>
      </div>
    </div>
  );
}

function CareCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
        <Icon size={16} />
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-800">
        {title}
      </p>
      <p className="mt-1 text-[10px] leading-4 text-slate-400">
        {text}
      </p>
    </div>
  );
}

export default function PatientOnboarding() {
  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "female",
    bloodGroup: "unknown",
    heightCm: "",
    weightKg: "",
    allergies: "",
    chronicConditions: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();

  const completion = useMemo(() => {
    const filled = [
      form.dateOfBirth,
      form.gender,
      form.bloodGroup !== "unknown" ? form.bloodGroup : "",
      form.heightCm,
      form.weightKg,
      form.allergies,
      form.chronicConditions,
    ].filter(Boolean).length;

    return Math.round((filled / 7) * 100);
  }, [form]);

  const activeStep =
    completion < 34 ? 1 : completion < 72 ? 2 : 3;

  function setField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setMessage("");
    setSaveError("");
  }

  function fillSample() {
    setForm(SAMPLE_PROFILE);
    setMessage("Sample profile added. Review the details and continue.");
    setSaveError("");
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSaveError("");

    try {
      await api.patch("/patients/me/profile", {
        ...form,
        heightCm: form.heightCm
          ? Number(form.heightCm)
          : undefined,
        weightKg: form.weightKg
          ? Number(form.weightKg)
          : undefined,
        allergies: form.allergies
          ? form.allergies
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
        chronicConditions: form.chronicConditions
          ? form.chronicConditions
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
      });

      navigate("/patient/dashboard");
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "We couldn't save your profile right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .onboarding-page {
          background:
            radial-gradient(circle at 8% 7%, rgba(15,110,91,.08), transparent 31rem),
            radial-gradient(circle at 92% 25%, rgba(16,185,129,.055), transparent 29rem),
            #f4f9f6;
        }

        .onboarding-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .34;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .onboarding-card {
          position: relative;
          overflow: hidden;
        }

        .onboarding-card::before,
        .onboarding-card::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .onboarding-card::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .onboarding-card::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.03);
        }

        .onboarding-card:hover::before,
        .onboarding-card:hover::after {
          width: 70%;
          height: 70%;
          border-radius: 2rem;
        }

        .onboarding-input {
          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            transform .25s ease,
            background .25s ease;
        }

        .onboarding-input:hover {
          border-color: rgba(15,110,91,.28);
          background: rgba(255,255,255,.82);
        }

        .onboarding-input:focus {
          border-color: rgba(15,110,91,.55);
          box-shadow: 0 0 0 4px rgba(15,110,91,.08);
          background: rgba(255,255,255,.95);
        }

        .save-button {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .save-button::before {
          content: "";
          position: absolute;
          top: -35%;
          left: -28%;
          width: 14%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.22),
            transparent
          );
          transition: left .8s ease;
          pointer-events: none;
          z-index: -1;
        }

        .save-button:hover::before {
          left: 125%;
        }

        .promo-shine::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.16),
            transparent
          );
          animation: onboarding-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes onboarding-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .onboarding-card::before,
          .onboarding-card::after,
          .save-button::before,
          .promo-shine::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Top rail */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to sign in
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
            <LockKeyhole size={12} className="text-primary" />
            Private profile setup
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="onboarding-card rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_25px_75px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-8 lg:p-9">
            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill inline-flex items-center gap-1.5">
                      <UserRound size={13} className="text-primary" />
                      Patient onboarding
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                      <BadgeCheck size={11} />
                      Care profile
                    </span>
                  </div>

                  <p className="eyebrow mt-6">Your health profile</p>

                  <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
                    Set up your profile,
                    <span className="block text-primary">
                      make every visit smarter.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    A few accurate details help your care team prepare before
                    the consultation starts. You can update these details
                    later from your profile.
                  </p>
                </div>

                <CompletionRing completion={completion} />
              </div>

              {/* Progress */}
              <div className="mt-8 rounded-[1.5rem] border border-slate-200/80 bg-white/55 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold text-slate-800">
                    Profile completion
                  </p>

                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
                    {completion === 100
                      ? "Ready"
                      : `${7 - Math.round((completion / 100) * 7)} fields left`}
                  </span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {STEPS.map(({ number, label, icon: Icon }, index) => (
                    <ProgressStep
                      key={number}
                      number={number}
                      label={label}
                      Icon={Icon}
                      active={activeStep === index + 1}
                      completed={activeStep > index + 1}
                    />
                  ))}
                </div>
              </div>

              {message && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-xs leading-5 text-emerald-800">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  {message}
                </div>
              )}

              {saveError && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
                  {saveError}
                </div>
              )}

              <form onSubmit={submit} className="mt-8 space-y-7">
                {/* Basics */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UserRound size={16} />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                        01 · Basics
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                        The essentials
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Date of birth"
                      hint="Used to calculate age and support care decisions."
                    >
                      <div className="relative">
                        <CalendarDays
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="date"
                          className="input onboarding-input h-12 pl-11"
                          value={form.dateOfBirth}
                          onChange={(e) =>
                            setField("dateOfBirth", e.target.value)
                          }
                          required
                        />
                      </div>
                    </Field>

                    <Field label="Gender">
                      <div className="relative">
                        <UserRound
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          className="input onboarding-input h-12 pl-11"
                          value={form.gender}
                          onChange={(e) =>
                            setField("gender", e.target.value)
                          }
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </Field>
                  </div>
                </section>

                {/* Vitals */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HeartPulse size={16} />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                        02 · Vitals
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                        Basic health measurements
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Blood group">
                      <div className="relative">
                        <Droplets
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          className="input onboarding-input h-12 pl-11"
                          value={form.bloodGroup}
                          onChange={(e) =>
                            setField("bloodGroup", e.target.value)
                          }
                        >
                          {[
                            "unknown",
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "AB+",
                            "AB-",
                            "O+",
                            "O-",
                          ].map((bloodGroup) => (
                            <option key={bloodGroup} value={bloodGroup}>
                              {bloodGroup}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Height (cm)">
                      <div className="relative">
                        <Height
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="number"
                          min="30"
                          max="250"
                          className="input onboarding-input h-12 pl-11"
                          placeholder="165"
                          value={form.heightCm}
                          onChange={(e) =>
                            setField("heightCm", e.target.value)
                          }
                        />
                      </div>
                    </Field>

                    <Field label="Weight (kg)">
                      <div className="relative">
                        <Weight
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="number"
                          min="1"
                          max="500"
                          step="0.1"
                          className="input onboarding-input h-12 pl-11"
                          placeholder="60"
                          value={form.weightKg}
                          onChange={(e) =>
                            setField("weightKg", e.target.value)
                          }
                        />
                      </div>
                    </Field>
                  </div>
                </section>

                {/* Care context */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck size={16} />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                        03 · Care context
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
                        Help your doctor prepare
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Known allergies"
                      hint="Separate multiple entries with commas."
                    >
                      <input
                        className="input onboarding-input h-12"
                        value={form.allergies}
                        onChange={(e) =>
                          setField("allergies", e.target.value)
                        }
                        placeholder="Penicillin, Peanuts"
                      />
                    </Field>

                    <Field
                      label="Chronic conditions"
                      hint="Separate multiple entries with commas."
                    >
                      <input
                        className="input onboarding-input h-12"
                        value={form.chronicConditions}
                        onChange={(e) =>
                          setField(
                            "chronicConditions",
                            e.target.value
                          )
                        }
                        placeholder="Diabetes, Hypertension"
                      />
                    </Field>
                  </div>
                </section>

                {/* Why it matters */}
                <section className="rounded-[1.6rem] border border-primary/10 bg-primary/[0.035] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <Info size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Why these details matter
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Accurate profile information can help your doctor
                        understand your context before the consultation and
                        tailor the conversation appropriately.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <LockKeyhole
                      size={12}
                      className="text-primary/70"
                    />
                    You can update this profile later.
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={fillSample}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                    >
                      <Sparkles size={14} />
                      Fill sample info
                    </button>

                    <button
                      disabled={loading}
                      className="save-button group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving profile...
                        </>
                      ) : (
                        <>
                          Save and continue
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Side panel */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="promo-shine group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_25px_75px_rgba(15,23,42,.14)]">
              <img
                src={HERO_IMAGE}
                alt="Healthcare consultation"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />

              <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] backdrop-blur-md">
                    KapHealth care profile
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <HeartPulse size={16} />
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200">
                    Better prepared care
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Give your doctor the context before hello.
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Your profile helps keep future consultations more
                    informed and focused.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_20px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Why KapHealth asks</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    A smoother care journey
                  </h2>
                </div>

                <CheckCircle2 size={17} className="text-primary" />
              </div>

              <div className="mt-4 grid gap-2.5">
                <CareCard
                  icon={HeartPulse}
                  title="Prepared consultations"
                  text="Key health context is available before the visit begins."
                />
                <CareCard
                  icon={ShieldCheck}
                  title="Connected profile"
                  text="Keep your details available across your KapHealth journey."
                />
                <CareCard
                  icon={Sparkles}
                  title="Less repetition"
                  text="Update details once and keep them ready for future care."
                />
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LockKeyhole size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Profile privacy
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Review what you enter before saving. You can update your
                    health profile later.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <ShieldCheck size={11} className="text-primary/70" />
          KapHealth · patient profile setup
          <ChevronRight size={11} />
        </div>
      </main>
    </div>
  );
}
