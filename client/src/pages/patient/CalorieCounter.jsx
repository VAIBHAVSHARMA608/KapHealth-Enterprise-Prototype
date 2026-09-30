import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Apple,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Flame,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";

import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_LABEL = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MEAL_ICON = {
  breakfast: "☀",
  lunch: "◒",
  dinner: "☾",
  snack: "•",
};

function today() {
  // Use the browser's local date, not UTC, so India/other time zones
  // do not accidentally open yesterday's meal log around midnight.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeTotals(value = {}) {
  return {
    calories: Number(value.calories || 0),
    proteinG: Number(value.proteinG || 0),
    carbsG: Number(value.carbsG || 0),
    fatG: Number(value.fatG || 0),
  };
}

function normalizeFood(food) {
  return {
    ...food,
    calories: Number(food.calories || 0),
    proteinG: Number(food.proteinG || 0),
    carbsG: Number(food.carbsG || 0),
    fatG: Number(food.fatG || 0),
  };
}

const WELLNESS_ADS = [
  {
    eyebrow: "DEMO OFFER · NUTRITION",
    title: "Build a smarter plate.",
    copy: "Explore balanced-meal guidance and turn today's calorie log into a more useful wellness routine.",
    cta: "Explore wellness",
    to: "/patient/wellness",
    image:
      "https://images.pexels.com/photos/11076093/pexels-photo-11076093.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Healthy balanced meal with vegetables",
    badge: "15% demo offer",
  },
  {
    eyebrow: "FEATURED · SMART MEAL",
    title: "Make every meal count.",
    copy: "Review your meal choices, discover helpful nutrition context, and keep your next step visible.",
    cta: "Open AI reviewer",
    to: "/patient/ai-reviewer",
    image:
      "https://images.pexels.com/photos/6632286/pexels-photo-6632286.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Person holding a nutritious bowl",
    badge: "Featured wellness",
  },
  {
    eyebrow: "WELLNESS VIDEO · DEMO",
    title: "See healthy eating in motion.",
    copy: "A short stock clip adds a more editorial, campaign-style layer to the nutrition experience.",
    cta: "Explore wellness",
    to: "/patient/wellness",
    image:
      "https://images.pexels.com/photos/6740511/pexels-photo-6740511.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Person enjoying a healthy meal",
    video:
      "https://videos.pexels.com/video-files/6740374/6740374-hd_1920_1080_25fps.mp4",
    badge: "Stock video",
  },
];

export default function CalorieCounter() {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });
  const [target, setTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [servings, setServings] = useState(1);
  const [loadingLog, setLoadingLog] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [targetError, setTargetError] = useState("");
  const [foodSearchError, setFoodSearchError] = useState("");
  const [adIndex, setAdIndex] = useState(0);
  const [showAd, setShowAd] = useState(true);

  const loadLog = useCallback(async () => {
    setLoadingLog(true);

    try {
      const { data } = await api.get(`/wellness/meal-log/${date}`);

      const safeEntries = Array.isArray(data?.entries)
        ? data.entries.map((entry) => ({
            ...entry,
            calories: Number(entry.calories || 0),
            proteinG: Number(entry.proteinG || 0),
            carbsG: Number(entry.carbsG || 0),
            fatG: Number(entry.fatG || 0),
            servings: Number(entry.servings || 1),
          }))
        : [];

      setEntries(safeEntries);
      setTotals(normalizeTotals(data?.totals));
      setError("");
    } catch (err) {
      setEntries([]);
      setTotals(normalizeTotals());
      setError(
        err.response?.data?.message ||
          "Couldn't load your meal log. Check that the wellness API is running and your session is valid."
      );
    } finally {
      setLoadingLog(false);
    }
  }, [date]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  useEffect(() => {
    let cancelled = false;

    async function loadTarget() {
      try {
        const { data } = await api.get("/wellness/diet-plans/active");

        if (cancelled) return;

        setTarget(data?.plan || null);
        setTargetError("");
      } catch (err) {
        if (!cancelled) {
          setTarget(null);
          setTargetError(
            err.response?.data?.message ||
              "No active diet target is available. Generate a diet plan first."
          );
        }
      }
    }

    loadTarget();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const query = search.trim();

      if (query.length < 2) {
        setFoods([]);
        setFoodSearchError("");
        setLoadingFoods(false);
        return;
      }

      setLoadingFoods(true);
      setFoodSearchError("");

      try {
        const { data } = await api.get("/wellness/foods", {
          params: { search: query },
        });

        if (!cancelled) {
          const safeFoods = Array.isArray(data?.foods)
            ? data.foods.map(normalizeFood)
            : [];

          setFoods(safeFoods);
        }
      } catch (err) {
        if (!cancelled) {
          setFoods([]);
          setFoodSearchError(
            err.response?.data?.message ||
              "Food database could not be reached."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingFoods(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  async function addFood(food) {
    const numericServings = Number(servings);

    if (!Number.isFinite(numericServings) || numericServings <= 0) {
      setError("Enter a valid serving amount greater than 0.");
      return;
    }

    if (!food?._id) {
      setError("This food item is missing its database ID.");
      return;
    }

    setError("");
    setActionId(`add-${food._id}`);

    try {
      // The backend remains the source of truth for calories/macros.
      // We send the selected food ID + serving count; we never invent
      // nutrition values in the browser.
      await api.post("/wellness/meal-log", {
        date,
        mealType: activeMeal,
        foodItemId: food._id,
        servings: numericServings,
      });

      setSearch("");
      setFoods([]);
      setServings(1);
      await loadLog();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't add this food to your meal log."
      );
    } finally {
      setActionId(null);
    }
  }

  async function removeEntry(id) {
    setError("");
    setActionId(`remove-${id}`);

    try {
      await api.delete(`/wellness/meal-log/${id}`);
      await loadLog();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't remove this meal entry."
      );
    } finally {
      setActionId(null);
    }
  }

  const calorieTarget = target?.calorieTarget;

  const calorieTargetNumber = Number(calorieTarget);

  const pct =
    Number.isFinite(calorieTargetNumber) && calorieTargetNumber > 0
      ? Math.round((totals.calories / calorieTargetNumber) * 100)
      : null;

  const remainingCalories =
    Number.isFinite(calorieTargetNumber) && calorieTargetNumber > 0
      ? calorieTargetNumber - totals.calories
      : null;

  const isOverTarget =
    remainingCalories != null && remainingCalories < 0;

  const macros = useMemo(
    () => [
      {
        label: "Protein",
        value: totals.proteinG,
        unit: "g",
        ratio:
          calorieTargetNumber > 0
            ? Math.min(
                100,
                Math.round(
                  ((totals.proteinG * 4) / calorieTargetNumber) * 100
                )
              )
            : null,
      },
      {
        label: "Carbs",
        value: totals.carbsG,
        unit: "g",
        ratio:
          calorieTargetNumber > 0
            ? Math.min(
                100,
                Math.round(
                  ((totals.carbsG * 4) / calorieTargetNumber) * 100
                )
              )
            : null,
      },
      {
        label: "Fat",
        value: totals.fatG,
        unit: "g",
        ratio:
          calorieTargetNumber > 0
            ? Math.min(
                100,
                Math.round(
                  ((totals.fatG * 9) / calorieTargetNumber) * 100
                )
              )
            : null,
      },
    ],
    [totals, calorieTargetNumber]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((index) => (index + 1) % WELLNESS_ADS.length);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const activeAd = WELLNESS_ADS[adIndex];

  return (
    <div className="wellness-surface relative min-h-screen overflow-hidden text-black">
      <style>{`
        /* Keep all normal page copy and typed/input text clearly black. */
        .wellness-surface {
          color: #000000;
        }

        .wellness-surface .glass-pill {
          color: #000000 !important;
        }

        .wellness-surface input,
        .wellness-surface textarea,
        .wellness-surface select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          caret-color: #000000 !important;
        }

        .wellness-surface input::placeholder,
        .wellness-surface textarea::placeholder {
          color: #4b5563 !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #4b5563 !important;
        }

        .wellness-surface option {
          color: #000000 !important;
          background: #ffffff !important;
        }

        /* Override slate text used by the existing Tailwind classes. */
        .wellness-surface .text-slate-950,
        .wellness-surface .text-slate-900,
        .wellness-surface .text-slate-800,
        .wellness-surface .text-slate-700,
        .wellness-surface .text-slate-600,
        .wellness-surface .text-slate-500,
        .wellness-surface .text-slate-400,
        .wellness-surface .text-slate-300 {
          color: #000000 !important;
        }

        /* Keep the dark campaign/target cards readable. */
        .wellness-surface .text-white,
        .wellness-surface .text-white\\/40,
        .wellness-surface .text-white\\/50,
        .wellness-surface .text-white\\/55,
        .wellness-surface .text-white\\/60,
        .wellness-surface .text-emerald-100,
        .wellness-surface .text-emerald-200,
        .wellness-surface .text-emerald-200\\/55,
        .wellness-surface .text-amber-200\\/90 {
          color: inherit;
        }

        .wellness-surface .wellness-dark-copy {
          color: #ffffff !important;
        }
      `}</style>

      <Navbar />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-48 top-[38%] h-[34rem] w-[34rem] rounded-full bg-accent/[0.06] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      {showAd && (
        <section className="relative mx-auto mt-4 max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            className={[
              "relative overflow-hidden rounded-[1.75rem] border border-white/75",
              "bg-white/70 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl",
            ].join(" ")}
          >
            <div className="absolute inset-y-0 right-0 hidden w-48 sm:block">
              {activeAd.video ? (
                <video
                  className="h-full w-full object-cover opacity-75"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={activeAd.image}
                >
                  <source src={activeAd.video} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={activeAd.image}
                  alt={activeAd.imageAlt}
                  className="h-full w-full object-cover opacity-75"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent" />
            </div>

            <div className="relative flex min-h-[132px] items-center gap-4 px-5 py-4 sm:min-h-[116px] sm:px-6">
              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>

              <div className="relative z-10 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                    {activeAd.eyebrow}
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-bold text-accent">
                    {activeAd.badge}
                  </span>
                </div>

                <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <h2 className="truncate text-sm font-semibold text-black sm:text-base">
                    {activeAd.title}
                  </h2>
                  <p className="line-clamp-1 hidden text-xs text-black sm:block">
                    {activeAd.copy}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Link
                    to={activeAd.to}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary transition hover:text-primary/75"
                  >
                    {activeAd.cta}
                    <ArrowRight size={12} />
                  </Link>

                  <div className="flex items-center gap-1">
                    {WELLNESS_ADS.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAdIndex(index)}
                        aria-label={`Show promotion ${index + 1}`}
                        className={[
                          "h-1 rounded-full transition-all duration-300",
                          index === adIndex
                            ? "w-5 bg-primary"
                            : "w-1.5 bg-slate-200 hover:bg-slate-300",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAd(false)}
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black transition hover:bg-slate-100"
                aria-label="Close promotion"
              >
                <span className="text-base leading-none">×</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}
        <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-9">
            <div className="glass-pill text-black">
              <Sparkles size={13} className="text-primary" />
              <span className="text-black">Wellness tracker</span>
            </div>

            <div className="mt-7 flex items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Daily nutrition</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                  Log your meals.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black">
                  Keep calories and macros visible throughout the day without
                  turning nutrition tracking into spreadsheet cosplay.
                </p>
              </div>

              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 sm:flex">
                <Flame size={25} strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <label className="group flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3.5 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/8">
                <CalendarDays
                  size={16}
                  className="text-slate-400 transition-colors group-focus-within:text-primary"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black">
                  Day
                </span>

                <input
                  className="bg-transparent text-xs font-semibold text-black outline-none"
                  type="date"
                  value={date}
                  max={today()}
                  onChange={(e) => {
                    setError("");
                    setDate(e.target.value);
                  }}
                  aria-label="Meal log date"
                />
              </label>

              {calorieTarget != null ? (
                <div className="flex h-11 items-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.04] px-3.5">
                  <Flame size={15} className="text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black">
                    Daily target
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {Math.round(calorieTargetNumber)} kcal
                  </span>
                </div>
              ) : (
                <Link
                  to="/patient/wellness/diet-planner"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-[10px] font-bold text-amber-800 transition hover:bg-amber-100"
                >
                  <Flame size={14} />
                  Create diet target
                </Link>
              )}
            </div>
          </div>

          {/* Daily target card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-7 text-white shadow-[0_18px_55px_rgba(15,23,42,0.14)]">
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-200/10 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <Flame size={18} />
                </div>

                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/60">
                  Today
                </span>
              </div>

              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200/55">
                Daily intake
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="font-mono text-4xl font-semibold tracking-tight">
                  {totals.calories}
                </span>
                <span className="mb-1 text-xs text-white/40">kcal</span>
              </div>

              {remainingCalories != null ? (
                <p className="mt-1 text-xs text-white/55">
                  {isOverTarget
                    ? `${Math.abs(Math.round(remainingCalories))} kcal over target`
                    : `${Math.round(remainingCalories)} kcal remaining`}
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/55">
                  Generate a diet plan to see your daily target.
                </p>
              )}

              {pct != null && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] text-white/55">
                    <span>{pct}% of target</span>
                    <span>{Math.round(calorieTargetNumber)} kcal</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={[
                        "h-full rounded-full transition-all duration-500",
                        isOverTarget ? "bg-rose-300" : "bg-emerald-200",
                      ].join(" ")}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>
              )}

              {targetError && (
                <p className="mt-3 text-[9px] leading-4 text-amber-200/90">
                  {targetError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Editorial campaign / stock-video banner */}
        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/80 bg-[#0A3F36] shadow-[0_20px_65px_rgba(15,23,42,0.10)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative p-6 text-white sm:p-7 lg:p-8">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                  <Play size={11} fill="currentColor" />
                  Wellness campaign
                </span>

                <h2 className="mt-6 max-w-md font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Small choices.
                  <span className="block text-emerald-200">
                    Better routines.
                  </span>
                </h2>

                <p className="mt-3 max-w-md text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">
                  Keep this editorial banner as the home for sponsored
                  wellness campaigns, seasonal partner offers, or in-product
                  educational media.
                </p>

                <Link
                  to="/patient/wellness"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white to-slate-100 px-4 py-2.5 text-xs font-semibold text-black shadow-[0_5px_4px_rgba(255,255,255,.35),0_8px_18px_rgba(0,0,0,.14)] transition hover:-translate-y-0.5 hover:text-primary"
                >
                  Explore wellness
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.pexels.com/photos/6740511/pexels-photo-6740511.jpeg?auto=compress&cs=tinysrgb&w=1200"
              >
                <source
                  src="https://videos.pexels.com/video-files/6740374/6740374-hd_1920_1080_25fps.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="absolute inset-0 bg-gradient-to-r from-[#0A3F36] via-[#0A3F36]/25 to-black/10" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 p-3 text-white backdrop-blur-xl sm:inset-x-5 sm:bottom-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Utensils size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Healthy meal inspiration</p>
                    <p className="mt-0.5 text-[9px] text-white/50">
                      Stock media · campaign-ready
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-semibold text-emerald-100 sm:inline-flex">
                  Featured
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Macro overview */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {macros.map((macro) => (
            <div
              key={macro.label}
              className="rounded-2xl border border-white/75 bg-white/65 p-4 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                  {macro.label}
                </p>

                {macro.ratio != null && (
                  <span className="text-[9px] font-semibold text-black">
                    {macro.ratio}%
                  </span>
                )}
              </div>

              <p className="mt-2 font-mono text-xl font-semibold text-black">
                {macro.value}
                <span className="ml-1 text-xs font-normal text-black">
                  {macro.unit}
                </span>
              </p>

              {macro.ratio != null && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${macro.ratio}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Search and log */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_370px]">
          <div className="glass-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Add food</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-black">
                  What did you eat?
                </h2>
                <p className="mt-1 text-xs leading-5 text-black">
                  Add foods to the meal you are currently tracking.
                </p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <Search size={17} />
              </div>
            </div>

            {/* Meal selector */}
            <div className="mt-5 flex overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 scrollbar-thin">
              {MEAL_TYPES.map((meal) => {
                const selected = activeMeal === meal;

                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => {
                      setError("");
                      setActiveMeal(meal);
                    }}
                    className={[
                      "flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all duration-300",
                      selected
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/[0.03]"
                        : "text-black hover:text-black",
                    ].join(" ")}
                  >
                    <span className="text-xs">{MEAL_ICON[meal]}</span>
                    {MEAL_LABEL[meal]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black">
                  Servings
                </p>
                <p className="mt-0.5 text-[10px] text-black">
                  Use the actual amount you consumed.
                </p>
              </div>

              <input
                className="input h-12 w-24 text-center font-semibold text-black"
                type="number"
                min="0.25"
                max="20"
                step="0.25"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                aria-label="Number of servings"
              />
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
              />

              <input
                className="input h-12 pl-11 pr-10 text-black"
                placeholder={`Search foods for ${MEAL_LABEL[activeMeal].toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFoods([]);
                    setFoodSearchError("");
                  }}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-black transition hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Results */}
            {(loadingFoods || foods.length > 0 || search.trim().length >= 2) && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl">
                {loadingFoods ? (
                  <div className="space-y-1 p-2">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl px-3 py-3"
                      >
                        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                          <div className="h-2 w-1/3 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : foods.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto p-1.5 scrollbar-thin">
                    {foods.map((food) => {
                      const adding = actionId === `add-${food._id}`;

                      return (
                        <button
                          key={food._id}
                          type="button"
                          onClick={() => addFood(food)}
                          disabled={adding}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary/[0.05] disabled:opacity-60"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-black transition group-hover:bg-primary/10 group-hover:text-primary">
                            <Apple size={16} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-black">
                              {food.name}
                            </span>
                            <span className="block truncate text-[10px] text-black">
                              {food.servingLabel}
                            </span>
                          </span>

                          <span className="flex items-center gap-2 text-[10px] font-semibold text-black">
                            {food.calories} kcal
                            {adding ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
                            ) : (
                              <Plus
                                size={15}
                                className="text-primary transition-transform group-hover:scale-110"
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-7 text-center">
                    <p className="text-xs font-semibold text-black">
                      No matching foods
                    </p>
                    <p className="mt-1 text-[10px] text-black">
                      Try a different food name.
                    </p>
                  </div>
                )}
              </div>
            )}

            {foodSearchError && (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800">
                {foodSearchError}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 text-[10px] text-black">
              <Utensils size={12} className="text-primary/70" />
              Calories and macros are read from the KapHealth food database;
              totals are recalculated by the server after every entry.
            </div>
          </div>

          {/* Today's meals */}
          <div className="glass-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Today</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-black">
                  Meal log
                </h2>
              </div>

              {loadingLog && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <p className="leading-5">{error}</p>
                <button
                  type="button"
                  onClick={() => loadLog()}
                  disabled={loadingLog}
                  className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {MEAL_TYPES.map((mealType) => {
                const mealEntries = entries.filter(
                  (entry) => entry.mealType === mealType
                );

                if (mealEntries.length === 0) {
                  return null;
                }

                const mealCalories = mealEntries.reduce(
                  (sum, entry) => sum + Number(entry.calories || 0),
                  0
                );

                return (
                  <div
                    key={mealType}
                    className="rounded-2xl border border-slate-200/80 bg-white/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 text-xs">
                          {MEAL_ICON[mealType]}
                        </span>

                        <div>
                          <p className="text-xs font-semibold text-black">
                            {MEAL_LABEL[mealType]}
                          </p>
                          <p className="text-[10px] text-black">
                            {mealEntries.length}{" "}
                            {mealEntries.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-[10px] font-semibold text-black">
                        {mealCalories} kcal
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {mealEntries.map((entry) => {
                        const removing = actionId === `remove-${entry._id}`;

                        return (
                          <div
                            key={entry._id}
                            className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-black">
                                {entry.name} × {entry.servings}
                              </p>
                              <p className="text-[9px] text-black">
                                {entry.calories} kcal · P {Number(entry.proteinG || 0).toFixed(1)}g · C {Number(entry.carbsG || 0).toFixed(1)}g · F {Number(entry.fatG || 0).toFixed(1)}g
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeEntry(entry._id)}
                              disabled={removing}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-black transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label={`Remove ${entry.name}`}
                            >
                              {removing ? (
                                <span className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-red-500" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!loadingLog && entries.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Utensils size={21} />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-black">
                    Your log is empty
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-black">
                    Search for a food above to start today's meal log.
                  </p>
                </div>
              )}
            </div>

            {entries.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-black">
                  <CheckCircle2 size={12} className="text-primary" />
                  Logged meals
                </span>

                <span className="text-[10px] font-semibold text-black">
                  {entries.length} total entries
                </span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
