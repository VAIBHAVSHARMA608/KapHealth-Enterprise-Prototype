import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  BadgeCheck,
  Brain,
  Check,
  ChevronRight,
  Droplet,
  Dumbbell,
  HeartPulse,
  Info,
  LockKeyhole,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const CATEGORY_META = {
  nutrition: {
    label: "Nutrition",
    icon: Utensils,
    tone: "green",
    copy: "Small food choices that make everyday nutrition easier.",
  },
  workout: {
    label: "Workout",
    icon: Dumbbell,
    tone: "blue",
    copy: "Training ideas for consistency, form, and progression.",
  },
  recovery: {
    label: "Recovery",
    icon: BatteryCharging,
    tone: "violet",
    copy: "Practical ways to support rest and recovery.",
  },
  hydration: {
    label: "Hydration",
    icon: Droplet,
    tone: "cyan",
    copy: "Simple hydration habits to keep your routine on track.",
  },
  sleep: {
    label: "Sleep",
    icon: Moon,
    tone: "indigo",
    copy: "Build a more consistent wind-down and sleep routine.",
  },
  mindset: {
    label: "Mindset",
    icon: Brain,
    tone: "coral",
    copy: "Short prompts for focus, consistency, and resilience.",
  },
};

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=85";

const LIFESTYLE_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85";

function CategoryPill({ active, label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2",
        "text-[10px] font-semibold transition-all duration-300",
        active
          ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
          : "border-white/75 bg-white/60 text-slate-500 backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:text-primary",
      ].join(" ")}
    >
      <Icon size={13} className="transition group-hover:scale-105" />
      {label}
    </button>
  );
}

function TipCard({ tip, index }) {
  const meta =
    CATEGORY_META[tip.category] || CATEGORY_META.nutrition;
  const Icon = meta.icon;

  return (
    <article className={`tip-card tip-${meta.tone} group`}>
      <span className="tip-corner tip-corner-top" />
      <span className="tip-corner tip-corner-bottom" />
      <span className="tip-shine" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="tip-icon">
            <Icon size={20} />
          </div>

          <div className="flex items-center gap-2">
            <span className="tip-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="tip-badge">{meta.label}</span>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/48">
            {meta.copy}
          </p>

          <h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-white">
            {tip.title}
          </h3>

          <p className="mt-3 text-xs leading-6 text-white/72">
            {tip.body}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-8">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white/48">
            <HeartPulse size={11} />
            Wellness insight
          </span>

          <span className="tip-arrow">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}

function QuickInsight({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-[1.4rem] border border-slate-200/75 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
        <Icon size={16} />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function CategoryShowcase({ category, onOpen }) {
  const meta =
    CATEGORY_META[category] || CATEGORY_META.nutrition;
  const Icon = meta.icon;

  return (
    <div className={`category-showcase category-${meta.tone}`}>
      <div className="category-showcase-glow" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-sm backdrop-blur-md">
            <Icon size={19} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/55">
              Focus category
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {meta.label}
            </h2>
          </div>
        </div>

        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em] text-white/65">
          Curated
        </span>
      </div>

      <div className="relative z-10 mt-7 max-w-xl">
        <p className="text-sm leading-6 text-white/70">
          {meta.copy}
        </p>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Explore {meta.label}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function WellnessTips() {
  const [tips, setTips] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTips(selectedCategory) {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/wellness/tips", {
        params: selectedCategory
          ? { category: selectedCategory }
          : {},
      });

      setTips(data.tips || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load wellness tips."
      );
      setTips([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTips(category);
  }, [category]);

  const featuredCategory = useMemo(
    () => category || "nutrition",
    [category]
  );

  const categoryCount = tips.length;

  return (
    <div className="wellness-tips-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .wellness-tips-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.09), transparent 31rem),
            radial-gradient(circle at 94% 24%, rgba(16,185,129,.055), transparent 29rem),
            #f4f9f6;
        }

        .wellness-tips-page::before {
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

        /* Uiverse-inspired expanding corner cards */
        .tip-card {
          position: relative;
          min-height: 275px;
          overflow: hidden;
          border-radius: 30px;
          padding: 23px;
          box-shadow: 0 20px 60px rgba(15,23,42,.08);
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease;
        }

        .tip-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 32px 80px rgba(15,23,42,.13);
        }

        .tip-green {
          background: linear-gradient(135deg, #0f6e5b, #14a982);
        }

        .tip-blue {
          background: linear-gradient(135deg, #246da9, #5caedf);
        }

        .tip-violet {
          background: linear-gradient(135deg, #6e4fc5, #a477dc);
        }

        .tip-cyan {
          background: linear-gradient(135deg, #117c90, #44bacb);
        }

        .tip-indigo {
          background: linear-gradient(135deg, #4452a8, #7382d5);
        }

        .tip-coral {
          background: linear-gradient(135deg, #e05e45, #f18c6b);
        }

        .tip-corner {
          position: absolute;
          width: 20%;
          height: 20%;
          pointer-events: none;
          background: rgba(255,255,255,.10);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .tip-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 30px 0 100%;
        }

        .tip-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 30px;
          background: rgba(255,255,255,.06);
        }

        .tip-card:hover .tip-corner {
          width: 100%;
          height: 100%;
          border-radius: 30px;
        }

        .tip-icon {
          display: flex;
          width: 49px;
          height: 49px;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.17);
          background: rgba(255,255,255,.14);
          box-shadow: 0 10px 25px rgba(0,0,0,.08);
          backdrop-filter: blur(8px);
          transition: transform .35s ease;
        }

        .tip-card:hover .tip-icon {
          transform: scale(1.07) rotate(-4deg);
        }

        .tip-index {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 9px;
          font-weight: 700;
          color: rgba(255,255,255,.42);
        }

        .tip-badge {
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.08);
          padding: 7px 9px;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .11em;
          color: rgba(255,255,255,.67);
          backdrop-filter: blur(8px);
        }

        .tip-arrow {
          display: flex;
          width: 35px;
          height: 35px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.13);
          transition: transform .3s ease, background .3s ease;
        }

        .tip-card:hover .tip-arrow {
          transform: translateX(4px);
          background: rgba(255,255,255,.23);
        }

        .tip-shine {
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

        .tip-card:hover .tip-shine {
          left: 135%;
        }

        .category-showcase {
          position: relative;
          min-height: 250px;
          overflow: hidden;
          border-radius: 32px;
          padding: 26px;
          box-shadow: 0 24px 75px rgba(15,23,42,.12);
        }

        .category-green {
          background: linear-gradient(135deg, #0f6e5b, #0a9273);
        }

        .category-orange {
          background: linear-gradient(135deg, #e88738, #f2b05e);
        }

        .category-coral {
          background: linear-gradient(135deg, #df654a, #f08d6d);
        }

        .category-blue {
          background: linear-gradient(135deg, #2367a3, #5da8dd);
        }

        .category-violet {
          background: linear-gradient(135deg, #7050c6, #a276dd);
        }

        .category-cyan,
        .category-indigo {
          background: linear-gradient(135deg, #1b748b, #5baec4);
        }

        .category-showcase-glow {
          position: absolute;
          top: -90px;
          right: -80px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,.11);
          filter: blur(20px);
          transition: transform .6s ease;
        }

        .category-showcase:hover .category-showcase-glow {
          transform: scale(1.2);
        }

        .tips-promo {
          position: relative;
          overflow: hidden;
        }

        .tips-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.17), transparent);
          animation: tips-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes tips-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tip-card,
          .tip-corner,
          .tip-icon,
          .tip-arrow,
          .tip-shine,
          .category-showcase-glow,
          .tips-promo::after {
            transition: none !important;
            animation: none !important;
          }

          .tip-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  Tips & tricks
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <BadgeCheck size={11} />
                  Wellness library
                </span>
              </div>

              <p className="eyebrow mt-6">
                Practical wellness intelligence
              </p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
                What should you eat?
                <span className="block text-primary">
                  How should you move?
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Browse short, practical wellness guidance across nutrition,
                training, recovery, hydration, sleep, and mindset.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                Current library
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900">
                {loading ? "—" : categoryCount}
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                {category ? CATEGORY_META[category]?.label : "All categories"}
              </p>
            </div>
          </div>

          {/* Category navigation */}
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
            <CategoryPill
              active={!category}
              label="All"
              Icon={Sparkles}
              onClick={() => setCategory("")}
            />

            {Object.entries(CATEGORY_META).map(
              ([key, { label, icon: Icon }]) => (
                <CategoryPill
                  key={key}
                  active={category === key}
                  label={label}
                  Icon={Icon}
                  onClick={() => setCategory(key)}
                />
              )
            )}
          </div>
        </section>

        {/* Category showcase */}
        <section className="mt-6">
          <CategoryShowcase
            category={featuredCategory}
            onOpen={() => setCategory(featuredCategory)}
          />
        </section>

        {/* Wellness cards */}
        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Curated insights</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                {category
                  ? `${CATEGORY_META[category]?.label || "Wellness"} tips`
                  : "Small changes, useful habits"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => loadTips(category)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/65 px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-slate-500 transition hover:border-primary/20 hover:text-primary"
            >
              <RefreshCw
                size={11}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
              <Info size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[275px] animate-pulse rounded-[30px] bg-slate-200/55"
                />
              ))}
            </div>
          ) : tips.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {tips.map((tip, index) => (
                <TipCard
                  key={tip._id}
                  tip={tip}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/50 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={23} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                No tips in this category yet.
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Try another category or return to the full wellness library.
              </p>

              <button
                type="button"
                onClick={() => setCategory("")}
                className="btn-primary mt-4 inline-flex"
              >
                View all tips
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </section>

        {/* Cross-promotion / advertising */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="tips-promo group relative min-h-[280px] overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_25px_75px_rgba(15,23,42,.13)]">
            <img
              src={WELLNESS_IMAGE}
              alt="Healthy food and wellness"
              className="absolute inset-0 h-full w-full object-cover opacity-36 transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/68 to-slate-950/10" />

            <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-6 text-white sm:p-7">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                  KapHealth Wellness
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Sparkles size={15} />
                </span>
              </div>

              <div className="max-w-xl">
                <p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  Go beyond tips
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Turn good advice into a routine.
                </h2>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Pair practical tips with your vitals tracker, calorie counter,
                  diet planner, and workout programs.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <LinkButton to="/patient/wellness/vitals">
                    Track vitals
                  </LinkButton>

                  <LinkButton to="/patient/wellness/diet-planner" secondary>
                    Plan nutrition
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative min-h-[280px] overflow-hidden rounded-[2rem] shadow-[0_25px_75px_rgba(15,23,42,.11)]">
            <img
              src={LIFESTYLE_IMAGE}
              alt="Fitness training"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <div className="relative z-10 flex min-h-[280px] flex-col justify-end p-6 text-white">
              <p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                Training & recovery
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                Better habits compound.
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/55">
                Explore sport-specific plans and recovery guidance when you're
                ready to put the advice into action.
              </p>

              <a
                href="/patient/wellness/workouts"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Open workout planner
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* Guidance / safety note */}
        <section className="mt-7 rounded-[1.8rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={15} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Wellness information, not diagnosis
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                Use these tips as general wellness guidance. For personal
                medical concerns or symptoms, use KapHealth's clinical care
                services and speak with a qualified professional.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · wellness tips library
          <ChevronRight size={11} />
          <TrendingUp size={11} className="text-primary/45" />
        </div>
      </main>
    </div>
  );
}

function LinkButton({ to, children, secondary = false }) {
  return (
    <Link
      to={to}
      className={
        secondary
          ? "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          : "inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
      }
    >
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}
