import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Flame,
  HeartPulse,
  Leaf,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";

const GOALS = [
  { value: "weight_loss", label: "Weight loss", short: "Lose weight", icon: "↘" },
  { value: "mild_weight_loss", label: "Mild weight loss", short: "Lean down", icon: "◒" },
  { value: "maintenance", label: "Maintenance", short: "Stay balanced", icon: "○" },
  { value: "mild_weight_gain", label: "Mild weight gain", short: "Build steadily", icon: "◓" },
  { value: "muscle_gain", label: "Muscle gain", short: "Build muscle", icon: "↗" },
];

const MEAL_LABEL = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const PROMO_IMAGE =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85";

const PROMO_IMAGE_ALT =
  "Healthy bowl with vegetables and nutritious food";

function GoalCard({ goal, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "goal-card group relative overflow-hidden rounded-[1.35rem] border p-4 text-left transition-all duration-500",
        selected
          ? "border-primary/30 bg-primary text-white shadow-[0_16px_35px_rgba(15,110,91,.20)]"
          : "border-slate-200/80 bg-white/65 text-slate-700 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_14px_35px_rgba(15,23,42,.08)]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute -right-7 -top-7 h-20 w-20 rounded-full transition-all duration-500",
          selected
            ? "bg-white/10 group-hover:h-[150%] group-hover:w-[150%]"
            : "bg-primary/[0.06] group-hover:h-[150%] group-hover:w-[150%]",
        ].join(" ")}
      />

      <span className="relative z-10 flex items-start justify-between gap-3">
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110",
            selected
              ? "bg-white/15 text-white"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          {goal.icon}
        </span>

        {selected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
            <Check size={13} />
          </span>
        )}
      </span>

      <span className="relative z-10 mt-5 block text-sm font-semibold">
        {goal.label}
      </span>
      <span
        className={[
          "relative z-10 mt-1 block text-[10px]",
          selected ? "text-white/65" : "text-slate-400",
        ].join(" ")}
      >
        {goal.short}
      </span>
    </button>
  );
}

function MacroCard({ label, value, suffix, icon: Icon, tone }) {
  return (
    <div className="macro-card group relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/65 p-5 shadow-[0_10px_35px_rgba(15,23,42,.05)] backdrop-blur-xl">
      <div
        className={`absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-[2.2] ${tone}`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition duration-500 group-hover:rotate-12 group-hover:scale-110">
            <Icon size={16} />
          </span>

          <TrendingUp
            size={14}
            className="text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:text-primary"
          />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900">
          {value}
          <span className="ml-1 text-sm font-medium text-slate-400">
            {suffix}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function DietPlanner() {
  const [goal, setGoal] = useState("maintenance");
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [error, setError] = useState("");

  function loadActive() {
    api
      .get("/wellness/diet-plans/active", {
        params: {
          forDependentId: bookingFor.dependentId || undefined,
        },
      })
      .then(({ data }) => setPlan(data.plan))
      .catch(() => {});
  }

  useEffect(loadActive, [bookingFor]);

  async function generate() {
    setError("");
    setGenerating(true);

    try {
      const { data } = await api.post("/wellness/diet-plans/generate", {
        goal,
        forDependentId: bookingFor.dependentId,
        forDependentName: bookingFor.dependentName,
      });

      setPlan(data.plan);
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't generate a plan."
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="wellness-surface relative min-h-screen overflow-hidden">
      <Navbar />

      <style>{`
        .diet-grid {
          background-image:
            linear-gradient(rgba(15,110,91,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.045) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: linear-gradient(to bottom, black, transparent 72%);
        }

        .goal-card::after {
          content: "";
          position: absolute;
          left: -40%;
          top: -120%;
          width: 35%;
          height: 350%;
          transform: rotate(22deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.25),
            transparent
          );
          transition: left .7s ease;
        }

        .goal-card:hover::after {
          left: 125%;
        }

        .glow-button {
          position: relative;
          isolation: isolate;
        }

        .glow-button::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -2;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f6e5b, #20a486, #75d7bd, #0f6e5b);
          background-size: 300% 300%;
          animation: gradient-flow 7s ease infinite;
          filter: blur(5px);
          opacity: .65;
        }

        .glow-button::after {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: -1;
          border-radius: 999px;
          background: #0f6e5b;
        }

        .glow-button:hover {
          transform: translateY(-2px);
        }

        .promo-shine {
          position: relative;
          overflow: hidden;
        }

        .promo-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 35%;
          transform: translateX(-160%) skewX(-18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.24),
            transparent
          );
          animation: promo-shine 5s ease-in-out infinite;
        }

        .flip-card {
          perspective: 1000px;
        }

        .flip-inner {
          transform-style: preserve-3d;
          transition: transform .8s cubic-bezier(.22,1,.36,1);
        }

        .flip-card:hover .flip-inner {
          transform: rotateY(180deg);
        }

        .flip-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flip-back {
          transform: rotateY(180deg);
        }

        .corner-reveal {
          position: relative;
          overflow: hidden;
        }

        .corner-reveal::before,
        .corner-reveal::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .corner-reveal::before {
          top: 0;
          right: 0;
          border-radius: 0 1.5rem 0 100%;
          background: rgba(15,110,91,.07);
        }

        .corner-reveal::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.5rem;
          background: rgba(15,110,91,.045);
        }

        .corner-reveal:hover::before,
        .corner-reveal:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
        }

        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes promo-shine {
          0%, 45% { transform: translateX(-160%) skewX(-18deg); }
          65%, 100% { transform: translateX(330%) skewX(-18deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .glow-button::before,
          .promo-shine::after {
            animation: none;
          }

          .flip-inner,
          .goal-card::after {
            transition: none;
          }
        }
      `}</style>

      <div className="diet-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-48 top-20 h-[30rem] w-[30rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-[28rem] h-[30rem] w-[30rem] rounded-full bg-emerald-200/20 blur-3xl" />

      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <div className="corner-reveal rounded-[2rem] border border-white/80 bg-white/60 p-7 shadow-[0_22px_70px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Personal wellness
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-700">
                  <HeartPulse size={11} />
                  Smart planning
                </span>
              </div>

              <p className="eyebrow mt-7">Diet planner</p>

              <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Build a plan that
                <span className="block text-primary">
                  fits your goal.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-ink/60 sm:text-base">
                Your calorie and macro targets are generated from your latest
                logged vitals. Choose a direction, then let KapHealth build
                the starting point.
              </p>

              <div className="mt-7">
                <BookingForPicker
                  value={bookingFor}
                  onChange={setBookingFor}
                />
              </div>
            </div>
          </div>

          {/* Advertisement */}
          <div className="promo-shine group relative min-h-[300px] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(15,23,42,.14)]">
            <img
              src={PROMO_IMAGE}
              alt={PROMO_IMAGE_ALT}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] backdrop-blur-md">
                  KapHealth wellness
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Leaf size={17} />
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-200">
                  Eat smarter
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Make every meal count.
                </h2>

                <p className="mt-2 max-w-xs text-xs leading-5 text-white/65">
                  Log meals, track calories, and turn your daily targets into
                  habits.
                </p>

                <Link
                  to="/patient/wellness/calorie-counter"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  Track today's meals
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Goal selector */}
        <section className="mt-7 corner-reveal rounded-[2rem] border border-white/80 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,.06)] backdrop-blur-2xl sm:p-7">
          <div className="relative z-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Step 01</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                  What's your goal?
                </h2>
              </div>

              <span className="text-[10px] font-medium text-ink/40">
                Choose one target
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
              {GOALS.map((item) => (
                <GoalCard
                  key={item.value}
                  goal={item}
                  selected={goal === item.value}
                  onClick={() => setGoal(item.value)}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="glow-button inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating your plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {plan ? "Regenerate my plan" : "Generate my plan"}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-3 text-[10px] font-medium text-slate-500">
                <ShieldIcon />
                Based on your latest vitals
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!plan && !error && !generating && (
          <section className="mt-7 grid gap-5 md:grid-cols-2">
            <div className="corner-reveal rounded-[2rem] border border-white/80 bg-white/60 p-7 shadow-sm backdrop-blur-xl">
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Target size={21} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-ink">
                  Your plan starts here.
                </h3>

                <p className="mt-2 text-sm leading-6 text-ink/55">
                  Pick a goal above and generate a personalised starting
                  target from your latest wellness data.
                </p>
              </div>
            </div>

            <div className="flip-card h-[220px]">
              <div className="flip-inner relative h-full w-full">
                <div className="flip-face absolute inset-0 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary to-emerald-700 p-7 text-white shadow-xl">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Sparkles size={23} />
                      <span className="text-[9px] font-bold uppercase tracking-[.16em] text-white/50">
                        Hover me
                      </span>
                    </div>

                    <div>
                      <p className="text-2xl font-semibold">
                        Small changes.
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        Better consistency.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flip-face flip-back absolute inset-0 rounded-[2rem] bg-white p-7 shadow-xl">
                  <p className="eyebrow">Next step</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink">
                    Log what you eat.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink/55">
                    Your calorie counter turns your target into a simple daily
                    feedback loop.
                  </p>
                  <Link
                    to="/patient/wellness/calorie-counter"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary"
                  >
                    Open calorie counter
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Generated plan */}
        {plan && (
          <>
            <section className="mt-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Step 02</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                    Your daily targets
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                  <Check size={12} />
                  Plan ready
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MacroCard
                  label="Calories"
                  value={plan.calorieTarget}
                  suffix="kcal"
                  icon={Flame}
                  tone="bg-orange-300/20"
                />

                <MacroCard
                  label="Protein"
                  value={plan.macros.proteinG}
                  suffix="g"
                  icon={TrendingUp}
                  tone="bg-blue-300/20"
                />

                <MacroCard
                  label="Carbs"
                  value={plan.macros.carbsG}
                  suffix="g"
                  icon={Utensils}
                  tone="bg-amber-300/20"
                />

                <MacroCard
                  label="Fat"
                  value={plan.macros.fatG}
                  suffix="g"
                  icon={HeartPulse}
                  tone="bg-rose-300/20"
                />
              </div>
            </section>

            <section className="mt-7 corner-reveal rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_20px_65px_rgba(15,23,42,.06)] backdrop-blur-2xl sm:p-7">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Step 03</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">
                      Sample day
                    </h2>
                  </div>

                  <Link
                    to="/patient/wellness/calorie-counter"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                  >
                    <CalendarDays size={14} />
                    Log today's meals
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {plan.sampleMeals?.map((meal, index) => (
                    <div
                      key={meal.mealType}
                      className="group rounded-2xl border border-slate-200/70 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Utensils size={15} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {MEAL_LABEL[meal.mealType]}
                            </p>
                            <p className="text-[9px] uppercase tracking-[.12em] text-ink/35">
                              Meal {String(index + 1).padStart(2, "0")}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          size={15}
                          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                        />
                      </div>

                      <div className="mt-4 space-y-2">
                        {meal.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-4 border-t border-slate-100 pt-2 text-xs"
                          >
                            <span className="min-w-0 text-ink/70">
                              {item.name}{" "}
                              <span className="text-ink/35">
                                ({item.servingLabel})
                              </span>
                            </span>

                            <span className="shrink-0 font-mono text-ink/55">
                              {item.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom advertisement */}
            <section className="mt-7 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_25px_80px_rgba(15,23,42,.15)]">
              <div className="grid lg:grid-cols-[1fr_340px]">
                <div className="relative overflow-hidden p-7 text-white sm:p-9">
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:32px_32px]" />

                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-emerald-300">
                      <Sparkles size={11} />
                      Complete your wellness journey
                    </span>

                    <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                      Need expert guidance with your plan?
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                      Connect with a verified doctor through a secure video
                      consultation and keep your wellness journey in one place.
                    </p>

                    <Link
                      to="/patient/doctors"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      Find a doctor
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[230px] overflow-hidden">
                  <img
                    src={PROMO_IMAGE}
                    alt={PROMO_IMAGE_ALT}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent lg:bg-gradient-to-r" />
                  <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-semibold uppercase tracking-[.12em] text-white/60 backdrop-blur-md">
                    Verified care
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function ShieldIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
      ✓
    </span>
  );
}
