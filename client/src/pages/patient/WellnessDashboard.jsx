import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronRight,
  Dumbbell,
  Flame,
  HeartPulse,
  LockKeyhole,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const FEATURES = [
  {
    to: "/patient/wellness/vitals",
    icon: Ruler,
    title: "Vitals & Body Metrics",
    blurb: "BMI, BMR, TDEE, body fat and muscle tracking.",
    kicker: "Measure",
    tone: "green",
    badge: "Core metrics",
  },
  {
    to: "/patient/wellness/diet-planner",
    icon: Utensils,
    title: "Diet Planner",
    blurb: "A calorie and macro plan built around your goal.",
    kicker: "Nutrition",
    tone: "orange",
    badge: "Personalized",
  },
  {
    to: "/patient/wellness/calorie-counter",
    icon: Flame,
    title: "Calorie Counter",
    blurb: "Log meals and understand your daily intake.",
    kicker: "Daily tracking",
    tone: "coral",
    badge: "Keep streaks",
  },
  {
    to: "/patient/wellness/workouts",
    icon: Dumbbell,
    title: "Workout Planner",
    blurb: "Programs across boxing, MMA, running and more.",
    kicker: "Training",
    tone: "blue",
    badge: "14+ sports",
  },
  {
    to: "/patient/wellness/ai-reviewer",
    icon: Camera,
    title: "AI Physique & Diet Reviewer",
    blurb: "Upload a photo for fast wellness feedback.",
    kicker: "AI reviewer",
    tone: "violet",
    badge: "Vision powered",
  },
  {
    to: "/patient/wellness/tips",
    icon: Sparkles,
    title: "Tips & Tricks",
    blurb: "Bite-sized nutrition, workout and recovery advice.",
    kicker: "Learn",
    tone: "teal",
    badge: "Daily insights",
  },
];

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=85";

const TRAINING_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85";

function GlassStackHero({ children }) {
  return (
    <div className="wellness-stack">
      <div className="wellness-glass wellness-glass-back" data-text="WELLNESS" />
      <div className="wellness-glass wellness-glass-mid" data-text="NUTRITION" />
      <div className="wellness-glass wellness-glass-front" data-text="FITNESS">
        <div className="wellness-glass-content">{children}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  title,
  blurb,
  kicker,
  tone,
  badge,
}) {
  return (
    <Link to={to} className={`feature-card feature-${tone} group`}>
      <span className="feature-corner feature-corner-top" />
      <span className="feature-corner feature-corner-bottom" />
      <span className="feature-shine" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="feature-icon">
            <Icon size={21} />
          </div>

          <span className="feature-badge">{badge}</span>
        </div>

        <div className="mt-7">
          <p className="feature-kicker">{kicker}</p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-xs leading-5 text-white/72">{blurb}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-8">
          <span className="text-[9px] font-bold uppercase tracking-[.14em] text-white/55">
            Open workspace
          </span>

          <span className="feature-arrow">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function WellnessStat({ icon: Icon, label, value, sub, to, tone }) {
  return (
    <Link to={to} className={`wellness-stat wellness-stat-${tone} group`}>
      <div className="wellness-stat-layer" />
      <div className="wellness-stat-content">
        <div className="flex items-start justify-between gap-3">
          <span className="wellness-stat-icon">
            <Icon size={15} />
          </span>
          <ChevronRight
            size={14}
            className="text-current/35 transition group-hover:translate-x-1"
          />
        </div>

        <p className="mt-5 text-[9px] font-bold uppercase tracking-[.14em] opacity-55">
          {label}
        </p>
        <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
        <p className="mt-1 text-[10px] leading-4 opacity-55">{sub}</p>
      </div>
    </Link>
  );
}

function StatusPill({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/55 px-3 py-1.5 text-[9px] font-semibold text-slate-600 shadow-sm backdrop-blur-md">
      <Icon size={11} className="text-primary" />
      {children}
    </span>
  );
}

export default function WellnessDashboard() {
  const [latestMetric, setLatestMetric] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWellness() {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get("/wellness/body-metrics", { params: { limit: 1 } }),
        api.get("/wellness/workout-plans/active"),
        api.get("/wellness/diet-plans/active"),
      ]);

      if (!mounted) return;

      const [metrics, workouts, diet] = results;

      if (metrics.status === "fulfilled") {
        setLatestMetric(metrics.value.data.metrics?.[0] || null);
      }

      if (workouts.status === "fulfilled") {
        setActivePlan(workouts.value.data.plan || null);
      }

      if (diet.status === "fulfilled") {
        setDietPlan(diet.value.data.plan || null);
      }

      setLoading(false);
    }

    loadWellness();

    return () => {
      mounted = false;
    };
  }, []);

  const metricValue = latestMetric?.bmi
    ? `BMI ${latestMetric.bmi}`
    : "No data";

  const metricSub = latestMetric?.bmiCategory || "Log your first measurement";

  const dietValue = dietPlan?.calorieTarget
    ? `${dietPlan.calorieTarget}`
    : "—";

  const dietSub = dietPlan?.calorieTarget
    ? "kcal / day target"
    : "Create a nutrition plan";

  const workoutValue = activePlan?.sport || "—";
  const workoutSub = activePlan
    ? "active workout plan"
    : "Choose a training program";

  const latestDate = latestMetric
    ? new Date(latestMetric.recordedAt).toLocaleDateString(
        undefined,
        { day: "numeric", month: "short", year: "numeric" }
      )
    : null;

  const wellnessScore = useMemo(() => {
    let score = 0;
    if (latestMetric) score += 34;
    if (dietPlan) score += 33;
    if (activePlan) score += 33;
    return score;
  }, [latestMetric, dietPlan, activePlan]);

  return (
    <div className="wellness-dashboard relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .wellness-dashboard {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.09), transparent 31rem),
            radial-gradient(circle at 94% 24%, rgba(16,185,129,.055), transparent 29rem),
            #f4f9f6;
        }

        .wellness-dashboard::before {
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

        /* Uiverse-inspired glass stack */
        .wellness-stack {
          position: relative;
          min-height: 390px;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .wellness-glass {
          position: absolute;
          inset: 0;
          margin: auto;
          width: min(100%, 820px);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,.45);
          box-shadow:
            0 28px 70px rgba(15,23,42,.10),
            inset 0 1px rgba(255,255,255,.45);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition:
            transform .6s cubic-bezier(.22,1,.36,1),
            margin .6s cubic-bezier(.22,1,.36,1),
            opacity .4s ease;
          transform: rotate(var(--rotate));
        }

        .wellness-glass::before {
          content: attr(data-text);
          position: absolute;
          bottom: 0;
          left: 0;
          display: flex;
          width: 100%;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 0 0 32px 32px;
          background: rgba(255,255,255,.055);
          color: rgba(255,255,255,.28);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .3em;
        }

        .wellness-glass-back {
          --rotate: -6deg;
          transform: translateX(-22px) rotate(-6deg);
          width: 92%;
          background: linear-gradient(180deg, rgba(15,110,91,.34), rgba(15,110,91,.08));
        }

        .wellness-glass-mid {
          --rotate: 5deg;
          transform: translateX(22px) rotate(5deg);
          width: 88%;
          background: linear-gradient(180deg, rgba(16,185,129,.28), rgba(255,255,255,.08));
        }

        .wellness-glass-front {
          --rotate: 0deg;
          z-index: 3;
          width: 100%;
          min-height: 360px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.76), rgba(255,255,255,.38)),
            rgba(255,255,255,.45);
          border-color: rgba(255,255,255,.80);
          color: #0f172a;
        }

        .wellness-glass-content {
          position: relative;
          height: 100%;
          padding: 34px;
          overflow: hidden;
          border-radius: inherit;
        }

        .wellness-glass-content::before {
          content: "";
          position: absolute;
          right: -80px;
          top: -80px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(15,110,91,.10);
          filter: blur(5px);
          pointer-events: none;
        }

        .wellness-glass-content::after {
          content: "";
          position: absolute;
          left: -100px;
          bottom: -120px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,107,74,.07);
          filter: blur(10px);
          pointer-events: none;
        }

        .wellness-stack:hover .wellness-glass-back {
          transform: translateX(-36px) rotate(-8deg);
        }

        .wellness-stack:hover .wellness-glass-mid {
          transform: translateX(36px) rotate(8deg);
        }

        .wellness-stack:hover .wellness-glass-front {
          transform: translateY(-4px);
        }

        /* Feature cards */
        .feature-card {
          position: relative;
          min-height: 250px;
          overflow: hidden;
          border-radius: 28px;
          padding: 22px;
          color: white;
          box-shadow: 0 20px 55px rgba(15,23,42,.08);
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 80px rgba(15,23,42,.13);
        }

        .feature-green {
          background: linear-gradient(135deg, #0f6e5b, #0fa982);
        }

        .feature-orange {
          background: linear-gradient(135deg, #e98a36, #f2b35c);
        }

        .feature-coral {
          background: linear-gradient(135deg, #e35d43, #f58e68);
        }

        .feature-blue {
          background: linear-gradient(135deg, #246aa9, #5daee1);
        }

        .feature-violet {
          background: linear-gradient(135deg, #7050c7, #a47be0);
        }

        .feature-teal {
          background: linear-gradient(135deg, #127a78, #36b9a3);
        }

        .feature-corner {
          position: absolute;
          width: 20%;
          height: 20%;
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
          background: rgba(255,255,255,.10);
        }

        .feature-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 28px 0 100%;
        }

        .feature-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 28px;
          background: rgba(255,255,255,.06);
        }

        .feature-card:hover .feature-corner {
          width: 100%;
          height: 100%;
          border-radius: 28px;
        }

        .feature-icon {
          display: flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 17px;
          background: rgba(255,255,255,.15);
          box-shadow: 0 10px 25px rgba(0,0,0,.09);
          backdrop-filter: blur(9px);
          transition: transform .35s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.07) rotate(-4deg);
        }

        .feature-badge {
          border-radius: 999px;
          padding: 7px 10px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.13);
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: rgba(255,255,255,.72);
          backdrop-filter: blur(8px);
        }

        .feature-kicker {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .16em;
          color: rgba(255,255,255,.55);
        }

        .feature-arrow {
          display: flex;
          width: 35px;
          height: 35px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.13);
          border: 1px solid rgba(255,255,255,.12);
          transition: transform .3s ease, background .3s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(4px);
          background: rgba(255,255,255,.22);
        }

        .feature-shine {
          position: absolute;
          top: -35%;
          left: -35%;
          width: 16%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.19), transparent);
          transition: left .8s ease;
          pointer-events: none;
        }

        .feature-card:hover .feature-shine {
          left: 135%;
        }

        /* Stats */
        .wellness-stat {
          position: relative;
          min-height: 165px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.72);
          box-shadow: 0 18px 55px rgba(15,23,42,.06);
          transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease;
        }

        .wellness-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 26px 65px rgba(15,23,42,.10);
        }

        .wellness-stat-layer {
          position: absolute;
          inset: 0;
          opacity: .96;
        }

        .wellness-stat-content {
          position: relative;
          z-index: 2;
          padding: 18px;
        }

        .wellness-stat-icon {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,.34);
          border: 1px solid rgba(255,255,255,.36);
          backdrop-filter: blur(8px);
        }

        .wellness-stat-green {
          color: #064e3b;
          background: linear-gradient(135deg, rgba(16,185,129,.20), rgba(255,255,255,.65));
        }

        .wellness-stat-orange {
          color: #713f12;
          background: linear-gradient(135deg, rgba(245,158,11,.20), rgba(255,255,255,.65));
        }

        .wellness-stat-blue {
          color: #123f6a;
          background: linear-gradient(135deg, rgba(59,130,246,.18), rgba(255,255,255,.65));
        }

        /* Promo */
        .wellness-ad {
          position: relative;
          overflow: hidden;
        }

        .wellness-ad::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
          animation: wellness-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes wellness-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (max-width: 900px) {
          .wellness-stack {
            min-height: 410px;
          }

          .wellness-glass-content {
            padding: 28px;
          }
        }

        @media (max-width: 640px) {
          .wellness-stack {
            min-height: auto;
            display: block;
            padding: 0;
          }

          .wellness-glass {
            display: none;
          }

          .wellness-glass-front {
            display: block;
            position: relative;
            min-height: 390px;
            transform: none !important;
            width: 100%;
          }

          .wellness-glass-content {
            padding: 23px;
          }

          .feature-card {
            min-height: 220px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wellness-glass,
          .feature-card,
          .feature-icon,
          .feature-arrow,
          .feature-corner,
          .feature-shine,
          .wellness-stat,
          .wellness-ad::after {
            transition: none !important;
            animation: none !important;
          }

          .wellness-stack:hover .wellness-glass-back,
          .wellness-stack:hover .wellness-glass-mid,
          .wellness-stack:hover .wellness-glass-front,
          .feature-card:hover,
          .wellness-stat:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero glass stack */}
        <GlassStackHero>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill icon={HeartPulse}>Wellness command center</StatusPill>
                <StatusPill icon={ShieldCheck}>Personal workspace</StatusPill>
              </div>

              <p className="eyebrow mt-7">Fitness · nutrition · recovery</p>

              <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.03] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Your wellness,
                <span className="block text-primary">
                  intelligently organized.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Measure your body, plan your nutrition, train with purpose and
                use AI-assisted wellness tools from one connected workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/patient/wellness/vitals"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  <Activity size={14} />
                  Start with vitals
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/patient/wellness/diet-planner"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/72 px-5 py-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                >
                  <Utensils size={14} />
                  Build diet plan
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.8rem] bg-slate-950 shadow-2xl">
              <img
                src={WELLNESS_IMAGE}
                alt="Healthy food and wellness"
                className="absolute inset-0 h-full w-full object-cover opacity-36"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/5" />

              <div className="relative z-10 flex min-h-[270px] flex-col justify-between p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] backdrop-blur-md">
                    KapHealth Wellness
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <Sparkles size={15} />
                  </span>
                </div>

                <div>
                  <div className="flex items-end gap-3">
                    <p className="font-mono text-4xl font-bold">
                      {loading ? "—" : wellnessScore}
                    </p>
                    <span className="mb-1 text-[9px] font-semibold uppercase tracking-[.12em] text-white/45">
                      setup score
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/45">
                    {wellnessScore === 100
                      ? "Your core wellness tools are all set up."
                      : "Complete more wellness modules to build a fuller routine."}
                  </p>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-300 transition-all duration-700"
                      style={{ width: `${wellnessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassStackHero>

        {/* Live state */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your current state</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Wellness at a glance
              </h2>
            </div>

            <span className="hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-slate-400 sm:flex">
              <Sparkles size={11} className="text-primary" />
              Connected to your account
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <WellnessStat
              icon={HeartPulse}
              label="Latest metric"
              value={loading ? "—" : metricValue}
              sub={loading ? "Loading..." : metricSub}
              to="/patient/wellness/vitals"
              tone="green"
            />

            <WellnessStat
              icon={Flame}
              label="Nutrition target"
              value={loading ? "—" : dietValue}
              sub={loading ? "Loading..." : dietSub}
              to="/patient/wellness/diet-planner"
              tone="orange"
            />

            <WellnessStat
              icon={Dumbbell}
              label="Training plan"
              value={loading ? "—" : workoutValue}
              sub={loading ? "Loading..." : workoutSub}
              to="/patient/wellness/workouts"
              tone="blue"
            />
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Explore wellness</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Six ways to work on your health
              </h2>
            </div>

            <span className="text-[10px] text-slate-400">
              Choose a workspace
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.to} {...feature} />
            ))}
          </div>
        </section>

        {/* Trend + advertising */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <TrendingUp size={13} />
                  Progress signal
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Your latest wellness snapshot
                </h2>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={17} />
              </span>
            </div>

            {latestMetric ? (
              <div className="mt-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Snapshot
                    label="Recorded"
                    value={latestDate}
                    sub="latest saved entry"
                  />
                  <Snapshot
                    label="Weight"
                    value={`${latestMetric.weightKg}kg`}
                    sub="latest body weight"
                  />
                  <Snapshot
                    label="TDEE"
                    value={`${latestMetric.tdee}`}
                    sub="kcal / day"
                  />
                </div>

                <Link
                  to="/patient/wellness/vitals"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                >
                  Open vitals tracker
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/45 p-9 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Ruler size={23} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  Start with a body-metrics entry.
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                  Your latest metrics will surface here once you calculate and
                  save your first wellness entry.
                </p>

                <Link
                  to="/patient/wellness/vitals"
                  className="btn-primary mt-4 inline-flex"
                >
                  Measure now
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          <div className="wellness-ad group relative min-h-[290px] overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_24px_75px_rgba(15,23,42,.13)]">
            <img
              src={TRAINING_IMAGE}
              alt="Fitness training"
              className="absolute inset-0 h-full w-full object-cover opacity-38 transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />

            <div className="relative z-10 flex h-full min-h-[290px] flex-col justify-between p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200 backdrop-blur-md">
                  Training spotlight
                </span>
                <Dumbbell size={18} className="text-white/60" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-200">
                  Build the habit
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Train smarter. Recover better.
                </h2>
                <p className="mt-2 max-w-md text-xs leading-5 text-white/50">
                  Pair your nutrition target with a sport-specific workout
                  plan and make your wellness routine more actionable.
                </p>

                <Link
                  to="/patient/wellness/workouts"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Explore workouts
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · wellness workspace
          <ChevronRight size={11} />
          <ShieldCheck size={11} className="text-primary/50" />
        </div>
      </main>
    </div>
  );
}

function Snapshot({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200/75 bg-white/55 p-4">
      <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-[9px] text-slate-400">{sub}</p>
    </div>
  );
}
