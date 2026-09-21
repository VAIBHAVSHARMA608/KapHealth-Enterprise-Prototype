import { useEffect, useState } from "react";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const SPORTS = [
  "Boxing", "MMA", "Wrestling", "Gymnastics", "Running", "Swimming",
  "Weightlifting / Strength", "Yoga", "Football", "Basketball",
  "Cycling", "CrossFit / Functional", "Calisthenics", "Badminton",
];

const EXAMPLE_SCHEDULE = JSON.stringify(
  [{ day: "Day 1", focus: "Full body", exercises: [{ name: "Squats", sets: 4, reps: "10", restSeconds: 60 }] }],
  null,
  2
);

const EMPTY_FORM = {
  sport: "Boxing", title: "", level: "beginner", goal: "general_fitness",
  description: "", durationWeeks: 4, sessionsPerWeek: 4, estimatedCaloriesPerSession: "",
  equipmentNeeded: "", weeklyScheduleJson: EXAMPLE_SCHEDULE,
};

export default function AdminWorkoutTemplates() {
  const { adminApi } = useAdminAuth();
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function load() {
    adminApi.get("/workout-templates").then(({ data }) => setTemplates(data.templates));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    let weeklySchedule;
    try {
      weeklySchedule = JSON.parse(form.weeklyScheduleJson);
    } catch {
      return setError("Weekly schedule isn't valid JSON -- check the example format.");
    }
    try {
      await adminApi.post("/workout-templates", {
        sport: form.sport, title: form.title, level: form.level, goal: form.goal,
        description: form.description, durationWeeks: Number(form.durationWeeks),
        sessionsPerWeek: Number(form.sessionsPerWeek),
        estimatedCaloriesPerSession: form.estimatedCaloriesPerSession ? Number(form.estimatedCaloriesPerSession) : undefined,
        equipmentNeeded: form.equipmentNeeded ? form.equipmentNeeded.split(",").map((s) => s.trim()) : [],
        weeklySchedule,
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save template.");
    }
  }

  async function deactivate(id) {
    await adminApi.delete(`/workout-templates/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Dumbbell size={34} />
          <div>
            <h1 className="text-3xl font-bold">Workout Templates</h1>
            <p className="mt-2 text-white/80">Manage sport-specific programs patients can adopt.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold"><Plus size={20} /> Add template</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" placeholder="Title" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {["beginner", "intermediate", "advanced"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
            {["fat_loss", "muscle_gain", "endurance", "strength", "skill", "general_fitness"].map((g) => <option key={g} value={g}>{g.replace(/_/g, " ")}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Duration (weeks)"
            value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Sessions/week"
            value={form.sessionsPerWeek} onChange={(e) => setForm({ ...form, sessionsPerWeek: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Est. kcal/session"
            value={form.estimatedCaloriesPerSession} onChange={(e) => setForm({ ...form, estimatedCaloriesPerSession: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-3" placeholder="Equipment needed (comma-separated)"
            value={form.equipmentNeeded} onChange={(e) => setForm({ ...form, equipmentNeeded: e.target.value })} />
        </div>

        <textarea rows={2} className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label className="mt-4 block text-sm font-medium text-slate-600">Weekly schedule (JSON)</label>
        <textarea rows={6} className="mt-1 w-full rounded-xl border p-3 font-mono text-xs outline-none focus:border-emerald-500"
          value={form.weeklyScheduleJson} onChange={(e) => setForm({ ...form, weeklyScheduleJson: e.target.value })} />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
          <Plus size={18} /> Add template
        </button>
      </form>

      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t._id} className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!t.isActive ? "opacity-50" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{t.title}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{t.sport}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-600">{t.level}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t.durationWeeks}w · {t.sessionsPerWeek}/week · {t.weeklySchedule.length} days scheduled</p>
            </div>
            {t.isActive && (
              <button onClick={() => deactivate(t._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white"><Trash2 size={18} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
