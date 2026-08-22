import { useEffect, useState } from "react";
import { Dumbbell, Clock, Flame, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

export default function WorkoutPlanner() {
  const [sports, setSports] = useState([]);
  const [sport, setSport] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get("/wellness/workout-templates/sports").then(({ data }) => setSports(data.sports));
    loadActivePlan();
  }, []);

  function loadActivePlan() {
    api.get("/wellness/workout-plans/active").then(({ data }) => setActivePlan(data.plan));
  }

  useEffect(() => {
    api.get("/wellness/workout-templates", { params: sport ? { sport } : {} }).then(({ data }) => setTemplates(data.templates));
  }, [sport]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function adopt(template) {
    await api.post(`/wellness/workout-templates/${template._id}/adopt`, {});
    showToast(`${template.title} is now your active plan`);
    setSelected(null);
    loadActivePlan();
  }

  async function completeSession(day) {
    if (!activePlan) return;
    await api.post(`/wellness/workout-plans/${activePlan._id}/complete-session`, { day });
    showToast("Session logged!");
    loadActivePlan();
  }

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Dumbbell size={14} /> Workout planner</p>
        <h1 className="font-display text-3xl font-medium text-ink">Programs for 14+ sports & disciplines</h1>
        <p className="mt-2 text-sm text-ink/65">Boxing, MMA, wrestling, gymnastics, running and more -- adopt a program and track your sessions.</p>

        {activePlan && (
          <div className="glass-card mt-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Active plan</p>
                <h2 className="mt-1 font-display text-xl font-medium text-ink">{activePlan.title}</h2>
                <p className="text-sm text-ink/60">{activePlan.sport} · {activePlan.level} · {activePlan.durationWeeks} weeks</p>
              </div>
              <span className="glass-pill"><CheckCircle2 size={13} /> {activePlan.completedSessions.length} sessions completed</span>
            </div>
            <div className="mt-5 space-y-3">
              {activePlan.weeklySchedule.map((day) => (
                <div key={day.day} className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{day.day} -- {day.focus}</p>
                    <p className="text-xs text-ink/60">{day.exercises.map((ex) => ex.name).join(", ")}</p>
                  </div>
                  <button onClick={() => completeSession(day.day)} className="btn-secondary !px-3 !py-1.5 text-xs shrink-0">
                    <CheckCircle2 size={14} /> Mark done
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setSport("")} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${!sport ? "border-primary bg-primary text-white" : "border-white/50 bg-white/40 text-ink/70"}`}>All sports</button>
          {sports.map((s) => (
            <button key={s.name} onClick={() => setSport(s.name)} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${sport === s.name ? "border-primary bg-primary text-white" : "border-white/50 bg-white/40 text-ink/70"}`}>
              {s.name} ({s.count})
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t._id} className="glass-card p-6">
              <span className="glass-pill">{t.sport}</span>
              <h3 className="mt-3 font-display text-lg font-medium text-ink">{t.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-ink/65">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/55">
                <span className="flex items-center gap-1"><Clock size={12} /> {t.durationWeeks}w · {t.sessionsPerWeek}/week</span>
                {t.estimatedCaloriesPerSession && <span className="flex items-center gap-1"><Flame size={12} /> ~{t.estimatedCaloriesPerSession} kcal/session</span>}
              </div>
              <span className="mt-2 inline-block rounded-full bg-white/50 px-2.5 py-0.5 text-[11px] font-medium capitalize text-ink/70">{t.level}</span>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setSelected(t)} className="btn-secondary flex-1 !py-2 text-xs">View plan</button>
                <button onClick={() => adopt(t)} className="btn-primary flex-1 !py-2 text-xs">Adopt</button>
              </div>
            </div>
          ))}
        </div>
        {templates.length === 0 && <p className="mt-6 text-center text-sm text-ink/50">No templates for this filter yet.</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center" onClick={() => setSelected(null)}>
          <div className="glass-panel max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <span className="glass-pill">{selected.sport}</span>
            <h2 className="mt-3 font-display text-2xl font-medium text-ink">{selected.title}</h2>
            <p className="mt-2 text-sm text-ink/65">{selected.description}</p>
            <div className="mt-5 space-y-4">
              {selected.weeklySchedule.map((day) => (
                <div key={day.day} className="rounded-2xl bg-white/50 p-4">
                  <p className="text-sm font-semibold text-ink">{day.day} — {day.focus}</p>
                  <div className="mt-2 space-y-1">
                    {day.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-ink/70">
                        <span className="flex items-center gap-1.5"><ChevronRight size={12} /> {ex.name}</span>
                        <span className="text-xs text-ink/50">{ex.sets ? `${ex.sets} x ` : ""}{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => adopt(selected)} className="btn-primary mt-6 w-full">Adopt this plan</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
