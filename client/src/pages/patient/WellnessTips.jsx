import { useEffect, useState } from "react";
import {
  Sparkles, Utensils, Dumbbell, BatteryCharging, Droplet, Moon, Brain,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const CATEGORY_META = {
  nutrition: { label: "Nutrition", icon: Utensils },
  workout: { label: "Workout", icon: Dumbbell },
  recovery: { label: "Recovery", icon: BatteryCharging },
  hydration: { label: "Hydration", icon: Droplet },
  sleep: { label: "Sleep", icon: Moon },
  mindset: { label: "Mindset", icon: Brain },
};

export default function WellnessTips() {
  const [tips, setTips] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.get("/wellness/tips", { params: category ? { category } : {} }).then(({ data }) => setTips(data.tips));
  }, [category]);

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Sparkles size={14} /> Tips & tricks</p>
        <h1 className="font-display text-3xl font-medium text-ink">What should you eat, what should you do</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setCategory("")} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${!category ? "border-primary bg-primary text-white" : "border-white/50 bg-white/40 text-ink/70"}`}>All</button>
          {Object.entries(CATEGORY_META).map(([key, { label, icon: Icon }]) => (
            <button key={key} onClick={() => setCategory(key)} className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition ${category === key ? "border-primary bg-primary text-white" : "border-white/50 bg-white/40 text-ink/70"}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => {
            const meta = CATEGORY_META[tip.category] || CATEGORY_META.nutrition;
            const Icon = meta.icon;
            return (
              <div key={tip._id} className="glass-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={18} /></div>
                <h3 className="mt-3 font-display text-base font-medium text-ink">{tip.title}</h3>
                <p className="mt-1.5 text-sm text-ink/65">{tip.body}</p>
              </div>
            );
          })}
        </div>
        {tips.length === 0 && <p className="mt-10 text-center text-sm text-ink/50">No tips in this category yet.</p>}
      </div>
    </div>
  );
}
