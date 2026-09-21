import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TRAINING_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=85";

const SECONDARY_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85";

function SportPill({ active, name, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold transition-all duration-300",
        active
          ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
          : "border-white/75 bg-white/60 text-slate-500 backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:text-primary",
      ].join(" ")}
    >
      {name}
      {typeof count === "number" && (
        <span className={active ? "ml-1 opacity-70" : "ml-1 opacity-45"}>
          ({count})
        </span>
      )}
    </button>
  );
}

function TemplateCard({ template, onView, onAdopt, adopting }) {
  return (
    <article className="workout-card group">
      <span className="workout-card-corner workout-card-corner-top" />
      <span className="workout-card-corner workout-card-corner-bottom" />
      <span className="workout-card-shine" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.13em] text-primary backdrop-blur-md">
            {template.sport}
          </span>

          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.11em] text-slate-500">
            {template.level}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
            <Dumbbell size={18} />
          </div>

          <p className="mt-5 text-[9px] font-bold uppercase tracking-[.14em] text-slate-300">
            Training program
          </p>

          <h3 className="mt-1.5 line-clamp-2 text-xl font-semibold leading-tight tracking-tight text-slate-900 transition group-hover:text-primary">
            {template.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
            {template.description}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500">
            <Clock size={11} />
            {template.durationWeeks} weeks
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500">
            <Activity size={11} />
            {template.sessionsPerWeek}/week
          </span>

          {template.estimatedCaloriesPerSession && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-[9px] font-semibold text-orange-700">
              <Flame size={11} />
              ~{template.estimatedCaloriesPerSession} kcal
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-2 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => onView(template)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/75 px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
          >
            <Play size={12} />
            View plan
          </button>

          <button
            type="button"
            onClick={() => onAdopt(template)}
            disabled={adopting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adopting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Adopting...
              </>
            ) : (
              <>
                <Check size={12} />
                Adopt
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivePlanPanel({ activePlan, onComplete, completingDay }) {
  const completed = activePlan.completedSessions?.length || 0;
  const totalSessions =
    (activePlan.weeklySchedule?.length || 0) *
    Math.max(1, activePlan.durationWeeks || 1);

  const completionPct = totalSessions
    ? Math.min(100, Math.round((completed / totalSessions) * 100))
    : 0;

  return (
    <section className="active-plan-panel group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
      <img
        src={TRAINING_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-primary/45" />

      <div className="relative z-10 p-6 text-white sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                Active plan
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/55">
                <BadgeCheck size={11} />
                {activePlan.sport}
              </span>
            </div>

            <p className="mt-6 text-[9px] font-bold uppercase tracking-[.15em] text-white/40">
              Current training block
            </p>

            <h2 className="mt-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {activePlan.title}
            </h2>

            <p className="mt-2 text-sm text-white/45">
              {activePlan.level} · {activePlan.durationWeeks} weeks
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md lg:min-w-[220px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/40">
                  Session progress
                </p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {completed}
                  <span className="text-sm font-normal text-white/35">
                    {" "}
                    completed
                  </span>
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <Trophy size={17} />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-300 transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            <p className="mt-2 text-[9px] text-white/35">
              {completionPct}% of estimated sessions
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-2.5">
          {activePlan.weeklySchedule?.map((day) => {
            const done = activePlan.completedSessions?.some(
              (session) =>
                session.day === day.day ||
                session === day.day
            );

            return (
              <div
                key={day.day}
                className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] px-4 py-3 transition hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-full text-[9px]",
                          done
                            ? "bg-emerald-300/15 text-emerald-200"
                            : "bg-white/10 text-white/50",
                        ].join(" ")}
                      >
                        {done ? <Check size={12} /> : <Dumbbell size={11} />}
                      </span>

                      <div>
                        <p className="text-xs font-semibold text-white">
                          {day.day}
                          <span className="text-white/35"> · </span>
                          {day.focus}
                        </p>

                        <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-white/35">
                          {day.exercises
                            ?.map((exercise) => exercise.name)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={done || completingDay === day.day}
                    onClick={() => onComplete(day.day)}
                    className={[
                      "shrink-0 rounded-full px-3.5 py-2 text-[9px] font-bold transition",
                      done
                        ? "border border-emerald-300/10 bg-emerald-300/10 text-emerald-200"
                        : "bg-white text-slate-950 hover:-translate-y-0.5 hover:shadow-lg",
                      completingDay === day.day
                        ? "cursor-wait opacity-60"
                        : "",
                    ].join(" ")}
                  >
                    {done
                      ? "Completed"
                      : completingDay === day.day
                        ? "Logging..."
                        : "Mark done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlanModal({ selected, onClose, onAdopt, adopting }) {
  if (!selected) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/80 bg-[#f8fbf9]/95 p-6 shadow-[0_35px_100px_rgba(15,23,42,.20)] backdrop-blur-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="glass-pill">{selected.sport}</span>
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.11em] text-slate-500">
                {selected.level}
              </span>
            </div>

            <p className="eyebrow mt-5">Program preview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {selected.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {selected.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/75 text-slate-400 transition hover:text-slate-900"
            aria-label="Close workout plan preview"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <PreviewStat
            icon={Clock}
            label="Duration"
            value={`${selected.durationWeeks} weeks`}
          />
          <PreviewStat
            icon={Activity}
            label="Frequency"
            value={`${selected.sessionsPerWeek}/week`}
          />
          <PreviewStat
            icon={Flame}
            label="Burn"
            value={
              selected.estimatedCaloriesPerSession
                ? `~${selected.estimatedCaloriesPerSession} kcal`
                : "Varies"
            }
          />
        </div>

        <div className="mt-6 space-y-3">
          {selected.weeklySchedule?.map((day) => (
            <div
              key={day.day}
              className="rounded-[1.5rem] border border-slate-200/80 bg-white/65 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {day.day}
                  </p>
                  <p className="mt-0.5 text-[10px] text-primary">
                    {day.focus}
                  </p>
                </div>

                <span className="rounded-full bg-primary/[0.06] px-2.5 py-1.5 text-[9px] font-semibold text-primary">
                  {day.exercises?.length || 0} exercises
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {day.exercises?.map((exercise, index) => (
                  <div
                    key={`${exercise.name}-${index}`}
                    className="flex items-center justify-between gap-4 py-2.5 text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                      <ChevronRight
                        size={12}
                        className="shrink-0 text-primary"
                      />
                      <span className="truncate">{exercise.name}</span>
                    </span>

                    <span className="shrink-0 font-mono text-[10px] text-slate-400">
                      {exercise.sets ? `${exercise.sets} × ` : ""}
                      {exercise.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAdopt(selected)}
          disabled={adopting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-50"
        >
          {adopting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Adopting plan...
            </>
          ) : (
            <>
              <Check size={14} />
              Adopt this plan
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PreviewStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/75 bg-white/55 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={13} className="text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function WorkoutPlanner() {
  const [sports, setSports] = useState([]);
  const [sport, setSport] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState("");
  const [adoptingId, setAdoptingId] = useState(null);
  const [completingDay, setCompletingDay] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      setLoading(true);
      setError("");

      try {
        const [sportsResponse, activeResponse] =
          await Promise.all([
            api.get("/wellness/workout-templates/sports"),
            api.get("/wellness/workout-plans/active"),
          ]);

        if (!mounted) return;

        setSports(sportsResponse.data.sports || []);
        setActivePlan(activeResponse.data.plan || null);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load your workout workspace."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitial();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadTemplates() {
      setTemplatesLoading(true);

      try {
        const { data } = await api.get(
          "/wellness/workout-templates",
          {
            params: sport ? { sport } : {},
          }
        );

        if (mounted) setTemplates(data.templates || []);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load workout programs."
          );
          setTemplates([]);
        }
      } finally {
        if (mounted) setTemplatesLoading(false);
      }
    }

    loadTemplates();

    return () => {
      mounted = false;
    };
  }, [sport]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function adopt(template) {
    setAdoptingId(template._id);

    try {
      const { data } = await api.post(
        `/wellness/workout-templates/${template._id}/adopt`,
        {}
      );

      showToast(`${template.title} is now your active plan`);
      setSelected(null);
      setActivePlan(data.plan || null);

      if (!data.plan) {
        await loadActivePlan();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't adopt this workout plan."
      );
    } finally {
      setAdoptingId(null);
    }
  }

  async function loadActivePlan() {
    try {
      const { data } = await api.get(
        "/wellness/workout-plans/active"
      );
      setActivePlan(data.plan || null);
    } catch {
      // Keep the existing UI if the refresh fails.
    }
  }

  async function completeSession(day) {
    if (!activePlan) return;

    setCompletingDay(day);

    try {
      const { data } = await api.post(
        `/wellness/workout-plans/${activePlan._id}/complete-session`,
        { day }
      );

      showToast("Session logged!");
      setActivePlan(data.plan || null);

      if (!data.plan) {
        await loadActivePlan();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't log this workout session."
      );
    } finally {
      setCompletingDay(null);
    }
  }

  const selectedSportMeta =
    sports.find((item) => item.name === sport) || null;

  return (
    <div className="workout-page relative min-h-screen overflow-hidden bg-[#f4f9f6] pb-10">
      <Navbar />

      <style>{`
        .workout-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 94% 24%, rgba(16,185,129,.055), transparent 28rem),
            #f4f9f6;
        }

        .workout-page::before {
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

        .workout-card {
          position: relative;
          min-height: 365px;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,.82);
          background: rgba(255,255,255,.70);
          padding: 20px;
          box-shadow: 0 20px 60px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease,
            background .4s ease;
        }

        .workout-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,.88);
          box-shadow: 0 30px 78px rgba(15,110,91,.11);
        }

        .workout-card-corner {
          position: absolute;
          width: 20%;
          height: 20%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .workout-card-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 30px 0 100%;
        }

        .workout-card-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 30px;
          background: rgba(15,110,91,.025);
        }

        .workout-card:hover .workout-card-corner {
          width: 100%;
          height: 100%;
          border-radius: 30px;
        }

        .workout-card-shine {
          position: absolute;
          top: -35%;
          left: -35%;
          width: 15%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.20), transparent);
          transition: left .8s ease;
          pointer-events: none;
        }

        .workout-card:hover .workout-card-shine {
          left: 135%;
        }

        .active-plan-panel::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
          animation: workout-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes workout-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (max-width: 640px) {
          .workout-card {
            min-height: 345px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workout-card,
          .workout-card-corner,
          .workout-card-shine,
          .active-plan-panel::after {
            transition: none !important;
            animation: none !important;
          }

          .workout-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
          <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <Dumbbell size={13} className="text-primary" />
                  Workout planner
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <BadgeCheck size={11} />
                  14+ sports & disciplines
                </span>
              </div>

              <p className="eyebrow mt-6">
                Train with a plan
              </p>

              <h1 className="mt-2 max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Find your discipline.
                <span className="block text-primary">
                  Build your routine.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Explore sport-specific programs, preview the weekly schedule,
                adopt one as your active plan, and mark sessions complete as
                you train.
              </p>
            </div>

            <div className="relative min-h-[245px] overflow-hidden rounded-[1.8rem] bg-slate-950 shadow-2xl">
              <img
                src={SECONDARY_IMAGE}
                alt="Workout training"
                className="absolute inset-0 h-full w-full object-cover opacity-38 transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />

              <div className="relative z-10 flex min-h-[245px] flex-col justify-between p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] backdrop-blur-md">
                    Training spotlight
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <Sparkles size={15} />
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                    From beginner to athlete
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Make consistency the goal.
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Choose a plan that fits your sport, level, and weekly
                    rhythm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active plan */}
        {activePlan && (
          <div className="mt-6">
            <ActivePlanPanel
              activePlan={activePlan}
              onComplete={completeSession}
              completingDay={completingDay}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 transition hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Sports filters */}
        <section className="mt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Browse programs</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Pick your training lane
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setSport("");
              }}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white/65 px-4 py-2 text-[9px] font-bold uppercase tracking-[.1em] text-slate-500 transition hover:border-primary/20 hover:text-primary"
            >
              <RefreshCw size={11} />
              Reset
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <SportPill
              active={!sport}
              name="All sports"
              onClick={() => setSport("")}
            />

            {sports.map((item) => (
              <SportPill
                key={item.name}
                active={sport === item.name}
                name={item.name}
                count={item.count}
                onClick={() => setSport(item.name)}
              />
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="mt-5">
          {templatesLoading || loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-[365px] animate-pulse rounded-[30px] border border-slate-200 bg-white/55"
                />
              ))}
            </div>
          ) : templates.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3 text-[9px] text-slate-400">
                <span>
                  {sport
                    ? `${selectedSportMeta?.name || sport} programs`
                    : "All available programs"}
                </span>
                <span>{templates.length} programs</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    onView={setSelected}
                    onAdopt={adopt}
                    adopting={adoptingId === template._id}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/50 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Dumbbell size={24} />
              </div>

              <p className="eyebrow mt-5">No programs found</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Nothing available for this filter yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another sport or return to all available programs.
              </p>

              <button
                type="button"
                onClick={() => setSport("")}
                className="btn-primary mt-5 inline-flex"
              >
                View all sports
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </section>

        {/* Bottom cross-promotion */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target size={18} />
              </div>

              <div>
                <p className="eyebrow">Connected wellness</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Train with context.
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              Pair your workout plan with your vitals and nutrition workspace
              so your training routine sits inside the rest of your wellness
              journey.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <LinkPill to="/patient/wellness/vitals">
                <HeartPulse size={12} />
                Vitals
              </LinkPill>

              <LinkPill to="/patient/wellness/diet-planner">
                <Flame size={12} />
                Diet
              </LinkPill>

              <LinkPill to="/patient/wellness/calorie-counter">
                <Activity size={12} />
                Calories
              </LinkPill>
            </div>
          </div>

          <div className="relative min-h-[245px] overflow-hidden rounded-[2rem] shadow-[0_22px_65px_rgba(15,23,42,.11)]">
            <img
              src={TRAINING_IMAGE}
              alt="Fitness training"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <div className="relative z-10 flex min-h-[245px] flex-col justify-end p-6 text-white">
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                Training inspiration
              </p>

              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                Show up. Log it. Repeat.
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/50">
                A plan only becomes useful once it becomes a habit.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · workout workspace
          <ChevronRight size={11} />
          <ShieldCheck size={11} className="text-primary/45" />
        </div>
      </main>

      <PlanModal
        selected={selected}
        onClose={() => setSelected(null)}
        onAdopt={adopt}
        adopting={Boolean(adoptingId)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl">
          <CheckCircle2 size={14} className="text-emerald-300" />
          {toast}
        </div>
      )}
    </div>
  );
}

function LinkPill({ to, children }) {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-[9px] font-bold text-slate-500 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
    >
      {children}
    </a>
  );
}
