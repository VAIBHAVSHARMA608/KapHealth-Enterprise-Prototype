import { useEffect, useState, useCallback } from "react";
import { Flame, Search, Plus, Trash2 } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalorieCounter() {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const [target, setTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [activeMeal, setActiveMeal] = useState("breakfast");

  const loadLog = useCallback(() => {
    api.get(`/wellness/meal-log/${date}`).then(({ data }) => {
      setEntries(data.entries);
      setTotals(data.totals);
    });
  }, [date]);

  useEffect(loadLog, [loadLog]);
  useEffect(() => {
    api.get("/wellness/diet-plans/active").then(({ data }) => setTarget(data.plan)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim().length < 2) return setFoods([]);
      api.get("/wellness/foods", { params: { search } }).then(({ data }) => setFoods(data.foods));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  async function addFood(food) {
    await api.post("/wellness/meal-log", { date, mealType: activeMeal, foodItemId: food._id, servings: 1 });
    setSearch("");
    setFoods([]);
    loadLog();
  }

  async function removeEntry(id) {
    await api.delete(`/wellness/meal-log/${id}`);
    loadLog();
  }

  const calorieTarget = target?.calorieTarget;
  const pct = calorieTarget ? Math.min(100, Math.round((totals.calories / calorieTarget) * 100)) : null;

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Flame size={14} /> Calorie counter</p>
        <h1 className="font-display text-3xl font-medium text-ink">Log your meals</h1>

        <div className="glass-card mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input className="input w-auto" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            {calorieTarget && <p className="text-sm text-ink/70">Target: <span className="font-semibold text-ink">{calorieTarget} kcal</span></p>}
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-3xl font-semibold text-ink">{totals.calories} <span className="text-base font-normal text-ink/50">kcal</span></p>
              {pct !== null && <p className="text-sm text-ink/60">{pct}% of target</p>}
            </div>
            {calorieTarget && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
            <div className="mt-3 flex gap-4 text-xs text-ink/60">
              <span>Protein {totals.proteinG}g</span>
              <span>Carbs {totals.carbsG}g</span>
              <span>Fat {totals.fatG}g</span>
            </div>
          </div>
        </div>

        <div className="glass-card mt-6 p-6">
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((m) => (
              <button key={m} onClick={() => setActiveMeal(m)} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${activeMeal === m ? "border-primary bg-primary text-white" : "border-white/50 bg-white/40 text-ink/70"}`}>
                {MEAL_LABEL[m]}
              </button>
            ))}
          </div>

          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input className="input pl-9" placeholder={`Search foods to add to ${MEAL_LABEL[activeMeal]}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {foods.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-2xl border border-white/50 bg-white/70">
              {foods.map((f) => (
                <button key={f._id} onClick={() => addFood(f)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-white/70">
                  <span>{f.name} <span className="text-ink/40">({f.servingLabel})</span></span>
                  <span className="flex items-center gap-2 font-mono text-xs text-ink/60">{f.calories} kcal <Plus size={14} /></span>
                </button>
              ))}
            </div>
          )}
        </div>

        {MEAL_TYPES.map((mealType) => {
          const mealEntries = entries.filter((e) => e.mealType === mealType);
          if (mealEntries.length === 0) return null;
          return (
            <div key={mealType} className="glass-card mt-4 p-5">
              <p className="text-sm font-semibold text-ink">{MEAL_LABEL[mealType]}</p>
              <div className="mt-2 space-y-2">
                {mealEntries.map((e) => (
                  <div key={e._id} className="flex items-center justify-between text-sm">
                    <span className="text-ink/80">{e.name} × {e.servings}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-ink/60">{e.calories} kcal</span>
                      <button onClick={() => removeEntry(e._id)} className="text-ink/30 hover:text-red-600"><Trash2 size={14} /></button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
