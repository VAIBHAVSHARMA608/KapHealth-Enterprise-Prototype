import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Ruler,
  Utensils,
  Flame,
  Dumbbell,
  Camera,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const FEATURES = [
  { to: "/patient/wellness/vitals", icon: Ruler, title: "Vitals & Body Metrics", blurb: "BMI, BMR, TDEE, body fat & muscle tracking" },
  { to: "/patient/wellness/diet-planner", icon: Utensils, title: "Diet Planner", blurb: "A calorie & macro plan built around your goal" },
  { to: "/patient/wellness/calorie-counter", icon: Flame, title: "Calorie Counter", blurb: "Log meals and track daily intake" },
  { to: "/patient/wellness/workouts", icon: Dumbbell, title: "Workout Planner", blurb: "Programs across boxing, MMA, running & more" },
  { to: "/patient/wellness/ai-reviewer", icon: Camera, title: "AI Physique & Diet Reviewer", blurb: "Upload a photo for instant feedback" },
  { to: "/patient/wellness/tips", icon: Sparkles, title: "Tips & Tricks", blurb: "Bite-sized nutrition, workout & recovery advice" },
];

export default function WellnessDashboard() {
  const [latestMetric, setLatestMetric] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);

  useEffect(() => {
    api.get("/wellness/body-metrics", { params: { limit: 1 } }).then(({ data }) => setLatestMetric(data.metrics?.[0] || null)).catch(() => {});
    api.get("/wellness/workout-plans/active").then(({ data }) => setActivePlan(data.plan)).catch(() => {});
    api.get("/wellness/diet-plans/active").then(({ data }) => setDietPlan(data.plan)).catch(() => {});
  }, []);

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Glass hero */}
        <div className="glass-panel relative overflow-hidden p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <p className="eyebrow mb-2">Wellness</p>
            <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">Your fitness & nutrition hub</h1>
            <p className="mt-3 max-w-xl text-sm text-ink/70">
              Calculate your vitals, plan your meals, follow a sport-specific workout program, and get instant AI-powered
              feedback on your physique and diet.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {latestMetric && (
                <span className="glass-pill"><Activity size={13} /> BMI {latestMetric.bmi} · {latestMetric.bmiCategory}</span>
              )}
              {dietPlan && (
                <span className="glass-pill"><Utensils size={13} /> {dietPlan.calorieTarget} kcal/day target</span>
              )}
              {activePlan && (
                <span className="glass-pill"><Dumbbell size={13} /> {activePlan.sport} plan active</span>
              )}
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ to, icon: Icon, title, blurb }) => (
            <Link key={to} to={to} className="glass-card group p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-medium text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-ink/65">{blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Open <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        {/* Quick trend teaser */}
        {latestMetric && (
          <div className="glass-card mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><TrendingUp size={20} /></div>
              <div>
                <p className="text-sm font-semibold text-ink">Last logged {new Date(latestMetric.recordedAt).toLocaleDateString()}</p>
                <p className="text-sm text-ink/60">Weight {latestMetric.weightKg}kg · BMR {latestMetric.bmr} kcal · TDEE {latestMetric.tdee} kcal</p>
              </div>
            </div>
            <Link to="/patient/wellness/vitals" className="btn-secondary !py-2">View trend <ArrowRight size={14} /></Link>
          </div>
        )}
      </div>
    </div>
  );
}
