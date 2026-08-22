import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Utensils, Sparkles, Flame } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";

const GOALS = [
  { value: "weight_loss", label: "Weight loss" },
  { value: "mild_weight_loss", label: "Mild weight loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "mild_weight_gain", label: "Mild weight gain" },
  { value: "muscle_gain", label: "Muscle gain" },
];

const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export default function DietPlanner() {
  const [goal, setGoal] = useState("maintenance");
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [error, setError] = useState("");

  function loadActive() {
    api.get("/wellness/diet-plans/active", { params: { forDependentId: bookingFor.dependentId || undefined } })
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
      setError(err.response?.data?.message || "Couldn't generate a plan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Utensils size={14} /> Diet planner</p>
        <h1 className="font-display text-3xl font-medium text-ink">Your calorie & macro target</h1>
        <p className="mt-2 text-sm text-ink/65">Generated from your latest logged vitals -- log a body metric entry first if you haven't.</p>

        <div className="mt-6"><BookingForPicker value={bookingFor} onChange={setBookingFor} /></div>

        <div className="glass-card mt-6 flex flex-wrap items-end gap-4 p-6">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Goal</label>
            <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
              {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={generating} className="btn-primary">
            <Sparkles size={16} /> {generating ? "Generating..." : plan ? "Regenerate plan" : "Generate plan"}
          </button>
        </div>

        {error && <p className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent backdrop-blur-md">{error}</p>}

        {plan && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="glass-card p-5"><Flame size={16} className="text-accent" /><p className="mt-2 font-mono text-2xl font-semibold text-ink">{plan.calorieTarget}</p><p className="text-xs text-ink/60">kcal / day</p></div>
              <div className="glass-card p-5"><p className="text-xs text-ink/60">Protein</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{plan.macros.proteinG}g</p></div>
              <div className="glass-card p-5"><p className="text-xs text-ink/60">Carbs</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{plan.macros.carbsG}g</p></div>
              <div className="glass-card p-5"><p className="text-xs text-ink/60">Fat</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{plan.macros.fatG}g</p></div>
            </div>

            <div className="glass-card mt-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-ink">Sample day</h2>
                <Link to="/patient/wellness/calorie-counter" className="text-xs font-semibold text-primary hover:underline">Log today's meals →</Link>
              </div>
              <div className="mt-4 space-y-5">
                {plan.sampleMeals?.map((meal) => (
                  <div key={meal.mealType}>
                    <p className="text-sm font-semibold text-ink">{MEAL_LABEL[meal.mealType]}</p>
                    <div className="mt-1.5 space-y-1">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-ink/70">
                          <span>{item.name} <span className="text-ink/40">({item.servingLabel})</span></span>
                          <span className="font-mono">{item.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!plan && !error && (
          <div className="glass-card mt-6 p-8 text-center text-sm text-ink/60">
            No active plan yet. Pick a goal above and generate one.
          </div>
        )}
      </div>
    </div>
  );
}
