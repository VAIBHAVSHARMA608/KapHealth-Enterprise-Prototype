import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardPlus,
  Droplets,
  HeartPulse,
  Info,
  LockKeyhole,
  Ruler,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  Weight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";

const EMPTY_FORM = {
  heightCm: "",
  weightKg: "",
  age: "",
  gender: "male",
  activityLevel: "moderate",
  waist: "",
  hip: "",
  chest: "",
  neck: "",
  arm: "",
  thigh: "",
  muscleMassKg: "",
  notes: "",
};

const HEALTH_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1500&q=85";

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85";

const ACTIVITY_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentary",
    detail: "Little / no exercise",
  },
  {
    value: "light",
    label: "Light",
    detail: "1–3 days / week",
  },
  {
    value: "moderate",
    label: "Moderate",
    detail: "3–5 days / week",
  },
  {
    value: "active",
    label: "Active",
    detail: "6–7 days / week",
  },
  {
    value: "very_active",
    label: "Very active",
    detail: "Athlete / physical job",
  },
];

const MEASUREMENT_FIELDS = [
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "chest", label: "Chest" },
  { key: "neck", label: "Neck" },
  { key: "arm", label: "Arm" },
  { key: "thigh", label: "Thigh" },
];

function GlassPanel({ children, className = "" }) {
  return (
    <section
      className={`vitals-panel rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  icon: Icon,
  required = false,
  placeholder,
  min,
  max,
  step = "any",
  hint,
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          className={`input vitals-input h-12 ${Icon ? "pl-10" : ""}`}
          type="number"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {hint && (
        <span className="mt-1.5 block text-[9px] leading-4 text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function ResultCard({ label, value, sub, icon: Icon, tone = "green" }) {
  return (
    <article className={`result-card result-${tone} group`}>
      <span className="result-corner result-corner-top" />
      <span className="result-corner result-corner-bottom" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-current shadow-sm backdrop-blur-md transition duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
            {Icon ? <Icon size={17} /> : <Activity size={17} />}
          </div>

          <span className="rounded-full bg-white/30 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em]">
            Metric
          </span>
        </div>

        <p className="mt-6 text-[9px] font-bold uppercase tracking-[.14em] opacity-60">
          {label}
        </p>

        <p className="mt-1 font-mono text-3xl font-bold leading-none">
          {value}
        </p>

        <p className="mt-2 line-clamp-2 text-[10px] leading-5 opacity-65">
          {sub}
        </p>
      </div>
    </article>
  );
}

function InsightCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-slate-200/75 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
        <Icon size={16} />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-800">{title}</p>

      <p className="mt-1 text-[10px] leading-5 text-slate-400">{text}</p>
    </div>
  );
}

function HistoryRow({ metric, onRemove }) {
  return (
    <div className="history-row group">
      <div className="history-date">
        <CalendarDays size={13} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-800">
          {new Date(metric.recordedAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        <p className="mt-1 truncate text-[10px] text-slate-400">
          {metric.weightKg}kg · BMI {metric.bmi} ({metric.bmiCategory}) · BMR{" "}
          {metric.bmr} · TDEE {metric.tdee}
          {metric.bodyFatPercent
            ? ` · Body fat ${metric.bodyFatPercent}%`
            : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(metric._id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Delete body metric entry"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function MetricProgress({ label, value, target, suffix = "" }) {
  const safeTarget = Number(target) || 1;
  const pct = Math.min(100, Math.round((Number(value) / safeTarget) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold text-slate-500">
          {label}
        </span>
        <span className="font-mono text-[10px] font-bold text-slate-700">
          {value}
          {suffix}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-1 text-[8px] text-slate-400">
        Compared with {target}
        {suffix}
      </p>
    </div>
  );
}

export default function VitalsTracker() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [error, setError] = useState("");

  function loadHistory() {
    api
      .get("/wellness/body-metrics", {
        params: {
          forDependentId:
            bookingFor.dependentId || undefined,
        },
      })
      .then(({ data }) => setHistory(data.metrics || []))
      .catch(() => {});
  }

  useEffect(() => {
    loadHistory();
  }, [bookingFor]);

  async function calculate(e) {
    e.preventDefault();
    setError("");
    setCalculating(true);

    try {
      const { data } = await api.post("/wellness/calculate", {
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        age: Number(form.age),
        gender: form.gender,
        activityLevel: form.activityLevel,
        waist: form.waist
          ? Number(form.waist)
          : undefined,
        neck: form.neck
          ? Number(form.neck)
          : undefined,
        hip: form.hip
          ? Number(form.hip)
          : undefined,
      });

      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't calculate. Please check your inputs."
      );
    } finally {
      setCalculating(false);
    }
  }

  async function saveEntry() {
    setSaving(true);
    setError("");

    try {
      await api.post("/wellness/body-metrics", {
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        age: Number(form.age),
        gender: form.gender,
        activityLevel: form.activityLevel,
        measurements: {
          waist: form.waist ? Number(form.waist) : undefined,
          hip: form.hip ? Number(form.hip) : undefined,
          chest: form.chest ? Number(form.chest) : undefined,
          neck: form.neck ? Number(form.neck) : undefined,
          arm: form.arm ? Number(form.arm) : undefined,
          thigh: form.thigh ? Number(form.thigh) : undefined,
        },
        muscleMassKg: form.muscleMassKg
          ? Number(form.muscleMassKg)
          : undefined,
        notes: form.notes,
        forDependentId: bookingFor.dependentId,
        forDependentName: bookingFor.dependentName,
      });

      loadHistory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't save the entry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id) {
    try {
      await api.delete(`/wellness/body-metrics/${id}`);
      loadHistory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't delete the entry."
      );
    }
  }

  function setField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError("");
  }

  const chartData = useMemo(
    () =>
      history
        .slice()
        .reverse()
        .map((metric) => ({
          date: new Date(metric.recordedAt).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
            }
          ),
          weight: metric.weightKg,
          bmi: metric.bmi,
        })),
    [history]
  );

  const latest = history[0];

  const weightDelta =
    latest && history[1]
      ? Number((latest.weightKg - history[1].weightKg).toFixed(1))
      : null;

  return (
    <div className="vitals-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .vitals-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 31rem),
            radial-gradient(circle at 93% 23%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .vitals-page::before {
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

        .vitals-panel {
          position: relative;
          overflow: hidden;
        }

        .vitals-panel::before,
        .vitals-panel::after {
          content: "";
          position: absolute;
          width: 16%;
          height: 16%;
          pointer-events: none;
          background: rgba(15,110,91,.04);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .vitals-panel::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .vitals-panel::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.025);
        }

        .vitals-panel:hover::before,
        .vitals-panel:hover::after {
          width: 55%;
          height: 55%;
          border-radius: 2rem;
        }

        .vitals-input {
          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease,
            transform .25s ease;
        }

        .vitals-input:hover {
          border-color: rgba(15,110,91,.25);
          background: rgba(255,255,255,.85);
        }

        .vitals-input:focus {
          border-color: rgba(15,110,91,.48);
          box-shadow: 0 0 0 4px rgba(15,110,91,.08);
          background: rgba(255,255,255,.96);
        }

        .activity-choice {
          position: relative;
          overflow: hidden;
        }

        .activity-choice::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(255,255,255,.6) 50%,
            transparent 70%
          );
          transform: translateX(-120%);
          transition: transform .7s ease;
          pointer-events: none;
        }

        .activity-choice:hover::after {
          transform: translateX(120%);
        }

        .result-card {
          position: relative;
          min-height: 192px;
          overflow: hidden;
          border-radius: 1.8rem;
          padding: 20px;
          box-shadow:
            0 18px 50px rgba(15,23,42,.07),
            inset 0 1px rgba(255,255,255,.6);
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease;
        }

        .result-green {
          background: linear-gradient(135deg, #0f6e5b, #24b18f);
          color: white;
        }

        .result-blue {
          background: linear-gradient(135deg, #256aa7, #69aee0);
          color: white;
        }

        .result-violet {
          background: linear-gradient(135deg, #7254c5, #aa84e1);
          color: white;
        }

        .result-coral {
          background: linear-gradient(135deg, #e5684d, #efa66b);
          color: white;
        }

        .result-card:hover {
          transform: translateY(-5px) rotateX(2deg) rotateY(-2deg);
          box-shadow: 0 28px 70px rgba(15,23,42,.11);
        }

        .result-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(255,255,255,.09);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .result-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.8rem 0 100%;
        }

        .result-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.8rem;
          background: rgba(255,255,255,.06);
        }

        .result-card:hover .result-corner {
          width: 90%;
          height: 90%;
          border-radius: 1.8rem;
        }

        .history-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 1rem;
          padding: 12px 6px;
          transition:
            background .25s ease,
            transform .25s ease;
        }

        .history-row:hover {
          background: rgba(15,110,91,.035);
          transform: translateX(2px);
        }

        .history-date {
          display: flex;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(15,110,91,.08);
          color: #0f6e5b;
        }

        .vitals-promo {
          position: relative;
          overflow: hidden;
        }

        .vitals-promo::after {
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
            rgba(255,255,255,.17),
            transparent
          );
          animation: vitals-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .save-vitals-button {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        .save-vitals-button::after {
          content: "";
          position: absolute;
          top: -40%;
          left: -25%;
          width: 13%;
          height: 180%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.25),
            transparent
          );
          transition: left .7s ease;
          pointer-events: none;
          z-index: -1;
        }

        .save-vitals-button:hover::after {
          left: 125%;
        }

        @keyframes vitals-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vitals-panel::before,
          .vitals-panel::after,
          .result-card,
          .result-corner,
          .activity-choice::after,
          .vitals-promo::after,
          .save-vitals-button::after {
            animation: none !important;
            transition: none !important;
          }

          .result-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5">
                <Ruler size={13} className="text-primary" />
                Wellness metrics
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                <ShieldCheck size={11} />
                Personal tracker
              </span>
            </div>

            <p className="eyebrow mt-6">Vitals tracker</p>

            <h1 className="mt-2 max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
              Understand your metrics.
              <span className="block text-primary">
                Track the trend over time.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Calculate BMI, BMR, TDEE, and available body-composition
              estimates, then save entries to build a simple personal trend
              history.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl">
            <LockKeyhole size={12} className="text-primary" />
            Your wellness workspace
          </div>
        </section>

        {/* Promo */}
        <section className="vitals-promo group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
          <div className="absolute inset-0">
            <img
              src={HEALTH_IMAGE}
              alt="Healthcare consultation"
              className="h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/15" />
          </div>

          <div className="relative z-10 flex min-h-[245px] items-center p-7 sm:p-9">
            <div className="max-w-2xl text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                  KapHealth Wellness
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/50">
                  Track · Compare · Improve
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Make your health data
                <span className="text-emerald-300"> useful.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                Save consistent measurements and use the trend view to see how
                your metrics change from entry to entry.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-[10px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck size={12} className="text-emerald-300" />
                  Personal history
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-emerald-300" />
                  Trend view
                </span>
                <span className="flex items-center gap-1.5">
                  <HeartPulse size={12} className="text-emerald-300" />
                  Connected wellness
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 hidden w-60 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 shadow-2xl backdrop-blur-md lg:block">
            <div className="aspect-video overflow-hidden">
              <img
                src={HEALTH_IMAGE}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white">
                  Personal wellness
                </p>
                <p className="mt-0.5 text-[9px] text-white/40">
                  Simple metrics, less guesswork
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <BookingForPicker
            value={bookingFor}
            onChange={setBookingFor}
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Input workspace */}
          <GlassPanel className="p-6 sm:p-7">
            <div>
              <p className="eyebrow">01 · Measurements</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Enter your current stats
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Required values drive the core calculations. Optional
                measurements can support additional estimates returned by the
                backend.
              </p>
            </div>

            <form onSubmit={calculate} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  label="Height (cm)"
                  value={form.heightCm}
                  onChange={(value) => setField("heightCm", value)}
                  icon={Ruler}
                  required
                  min="30"
                  max="250"
                  placeholder="165"
                />

                <NumberField
                  label="Weight (kg)"
                  value={form.weightKg}
                  onChange={(value) => setField("weightKg", value)}
                  icon={Weight}
                  required
                  min="1"
                  max="500"
                  placeholder="60"
                  step="0.1"
                />

                <NumberField
                  label="Age"
                  value={form.age}
                  onChange={(value) => setField("age", value)}
                  icon={CalendarDays}
                  required
                  min="1"
                  max="120"
                  placeholder="28"
                  step="1"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Gender</span>

                  <div className="relative">
                    <UserRound
                      size={15}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      className="input vitals-input h-12 pl-10"
                      value={form.gender}
                      onChange={(e) =>
                        setField("gender", e.target.value)
                      }
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="label">Activity level</span>

                  <div className="relative">
                    <Activity
                      size={15}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      className="input vitals-input h-12 pl-10"
                      value={form.activityLevel}
                      onChange={(e) =>
                        setField(
                          "activityLevel",
                          e.target.value
                        )
                      }
                    >
                      {ACTIVITY_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label} · {option.detail}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                      Optional body measurements
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      Add more context
                    </h3>
                  </div>

                  <span className="hidden text-[9px] text-slate-400 sm:block">
                    cm unless specified
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {MEASUREMENT_FIELDS.map((field) => (
                    <NumberField
                      key={field.key}
                      label={field.label}
                      value={form[field.key]}
                      onChange={(value) =>
                        setField(field.key, value)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Muscle mass (kg)"
                  value={form.muscleMassKg}
                  onChange={(value) =>
                    setField("muscleMassKg", value)
                  }
                  icon={Activity}
                  min="0"
                  max="300"
                  placeholder="Optional"
                  step="0.1"
                  hint="Optional field saved with the entry."
                />

                <label className="block">
                  <span className="label">Notes</span>
                  <input
                    className="input vitals-input h-12"
                    value={form.notes}
                    onChange={(e) =>
                      setField("notes", e.target.value)
                    }
                    placeholder="Anything you want to remember..."
                  />
                </label>
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
                  <Info
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-5">
                <button
                  disabled={calculating}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {calculating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Activity size={15} />
                      Calculate metrics
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                {result && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveEntry}
                    className="save-vitals-button group inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/80 px-5 py-3 text-xs font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save entry
                        <Check
                          size={13}
                          className="transition-transform group-hover:scale-110"
                        />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </GlassPanel>

          {/* Side panel */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <GlassPanel className="p-5">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Build a consistent record
                </h2>
              </div>

              <div className="mt-5 grid gap-2.5">
                <InsightCard
                  icon={ClipboardPlus}
                  title="Enter baseline stats"
                  text="Add the required metrics first, then optionally add body measurements."
                />
                <InsightCard
                  icon={Activity}
                  title="Calculate"
                  text="Your existing wellness calculation endpoint returns the supported metrics."
                />
                <InsightCard
                  icon={TrendingUp}
                  title="Save and compare"
                  text="Saved entries appear in history and power the trend chart."
                />
              </div>
            </GlassPanel>

            <div className="group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_25px_75px_rgba(15,23,42,.13)]">
              <img
                src={WELLNESS_IMAGE}
                alt="Healthy food and wellness"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10 flex min-h-[270px] flex-col justify-end p-6 text-white">
                <span className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  KapHealth Wellness
                </span>

                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Turn numbers into a routine.
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Pair your metrics with diet planning and calorie tracking for
                  a broader wellness workflow.
                </p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Wellness note
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    These calculations are tracking tools and should not be
                    treated as a medical diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Results */}
        {result && (
          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">02 · Results</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Your latest calculation
                </h2>
              </div>

              <span className="hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-slate-400 sm:flex">
                <CheckCircle2 size={12} className="text-primary" />
                Ready to save
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard
                label="BMI"
                value={result.bmi}
                sub={result.bmiCategory}
                icon={HeartPulse}
                tone="green"
              />

              <ResultCard
                label="BMR"
                value={result.bmr}
                sub="kcal/day at rest"
                icon={Activity}
                tone="blue"
              />

              <ResultCard
                label="TDEE"
                value={result.tdee}
                sub="kcal/day maintenance estimate"
                icon={Target}
                tone="violet"
              />

              <ResultCard
                label="Body fat"
                value={
                  result.bodyFatPercent
                    ? `${result.bodyFatPercent}%`
                    : "—"
                }
                sub={
                  result.bodyFatCategory ||
                  "Add the supported measurements to estimate"
                }
                icon={Droplets}
                tone="coral"
              />
            </div>
          </section>
        )}

        {/* Trend */}
        <section className="mt-8">
          <GlassPanel className="p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <TrendingUp size={13} />
                  Progress
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Weight trend
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your saved weight entries, ordered from oldest to newest.
                </p>
              </div>

              <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[9px] font-semibold text-slate-500">
                {history.length}{" "}
                {history.length === 1 ? "entry" : "entries"}
              </div>
            </div>

            {chartData.length > 1 ? (
              <div className="mt-6 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      domain={["auto", "auto"]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid rgba(148,163,184,.18)",
                        background: "rgba(255,255,255,.92)",
                        fontSize: 11,
                        boxShadow: "0 16px 40px rgba(15,23,42,.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#0F6E5B"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#0F6E5B",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#0F6E5B",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 flex min-h-[230px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/45 p-8 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <TrendingUp size={23} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    Save two entries to unlock the trend line.
                  </p>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    Consistent measurements make it easier to view changes
                    over time.
                  </p>
                </div>
              </div>
            )}

            {latest && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                    Latest weight
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    {latest.weightKg}kg
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    Latest saved entry
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                    Latest BMI
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    {latest.bmi}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    {latest.bmiCategory}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                    Since previous
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    {weightDelta === null
                      ? "—"
                      : `${weightDelta > 0 ? "+" : ""}${weightDelta}kg`}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    Based on the two latest saved weights
                  </p>
                </div>
              </div>
            )}
          </GlassPanel>
        </section>

        {/* History */}
        <section className="mt-7">
          <GlassPanel className="p-6 sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">03 · History</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Saved measurements
                </h2>
              </div>

              <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-slate-400">
                <Save size={11} className="text-primary" />
                Personal log
              </span>
            </div>

            {history.length === 0 ? (
              <div className="mt-5 rounded-[1.6rem] border border-dashed border-slate-300 bg-white/45 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ClipboardPlus size={24} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  No saved entries yet.
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                  Calculate your first set of metrics above, then save it to
                  start your personal history.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100/80">
                {history.map((metric) => (
                  <HistoryRow
                    key={metric._id}
                    metric={metric}
                    onRemove={removeEntry}
                  />
                ))}
              </div>
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <ShieldCheck size={11} className="text-primary/70" />
          KapHealth · wellness metrics workspace
          <ChevronRight size={11} />
        </section>
      </main>
    </div>
  );
}
