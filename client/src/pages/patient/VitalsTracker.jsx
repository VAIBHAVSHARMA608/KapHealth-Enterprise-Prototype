import { useEffect, useState } from "react";
import { Ruler, Save, Trash2, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";

const EMPTY_FORM = {
  heightCm: "", weightKg: "", age: "", gender: "male", activityLevel: "moderate",
  waist: "", hip: "", chest: "", neck: "", arm: "", thigh: "",
  muscleMassKg: "", notes: "",
};

export default function VitalsTracker() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [error, setError] = useState("");

  function loadHistory() {
    api.get("/wellness/body-metrics", { params: { forDependentId: bookingFor.dependentId || undefined } })
      .then(({ data }) => setHistory(data.metrics))
      .catch(() => {});
  }

  useEffect(loadHistory, [bookingFor]);

  async function calculate(e) {
    e.preventDefault();
    setError("");
    setCalculating(true);
    try {
      const { data } = await api.post("/wellness/calculate", {
        heightCm: Number(form.heightCm), weightKg: Number(form.weightKg), age: Number(form.age),
        gender: form.gender, activityLevel: form.activityLevel,
        waist: form.waist ? Number(form.waist) : undefined,
        neck: form.neck ? Number(form.neck) : undefined,
        hip: form.hip ? Number(form.hip) : undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't calculate -- check your inputs.");
    } finally {
      setCalculating(false);
    }
  }

  async function saveEntry() {
    setSaving(true);
    setError("");
    try {
      await api.post("/wellness/body-metrics", {
        heightCm: Number(form.heightCm), weightKg: Number(form.weightKg), age: Number(form.age),
        gender: form.gender, activityLevel: form.activityLevel,
        measurements: {
          waist: form.waist ? Number(form.waist) : undefined,
          hip: form.hip ? Number(form.hip) : undefined,
          chest: form.chest ? Number(form.chest) : undefined,
          neck: form.neck ? Number(form.neck) : undefined,
          arm: form.arm ? Number(form.arm) : undefined,
          thigh: form.thigh ? Number(form.thigh) : undefined,
        },
        muscleMassKg: form.muscleMassKg ? Number(form.muscleMassKg) : undefined,
        notes: form.notes,
        forDependentId: bookingFor.dependentId,
        forDependentName: bookingFor.dependentName,
      });
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save entry.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id) {
    await api.delete(`/wellness/body-metrics/${id}`);
    loadHistory();
  }

  const chartData = history.slice().reverse().map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    weight: m.weightKg,
    bmi: m.bmi,
  }));

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Ruler size={14} /> Vitals</p>
        <h1 className="font-display text-3xl font-medium text-ink">BMI, BMR, TDEE & body composition</h1>
        <p className="mt-2 text-sm text-ink/65">Enter your stats to calculate your vitals, then save an entry to track trends over time.</p>

        <div className="mt-6"><BookingForPicker value={bookingFor} onChange={setBookingFor} /></div>

        <form onSubmit={calculate} className="glass-card mt-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Height (cm)" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} required />
            <Field label="Weight (kg)" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} required />
            <Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} required />
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Activity level</label>
              <select className="input" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very active (athlete/physical job)</option>
              </select>
            </div>
          </div>

          <p className="label mt-5">Body measurements (cm, optional -- unlocks body-fat estimate)</p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            <Field label="Waist" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} />
            <Field label="Hip" value={form.hip} onChange={(v) => setForm({ ...form, hip: v })} />
            <Field label="Chest" value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} />
            <Field label="Neck" value={form.neck} onChange={(v) => setForm({ ...form, neck: v })} />
            <Field label="Arm" value={form.arm} onChange={(v) => setForm({ ...form, arm: v })} />
            <Field label="Thigh" value={form.thigh} onChange={(v) => setForm({ ...form, thigh: v })} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <Field label="Muscle mass (kg, optional)" value={form.muscleMassKg} onChange={(v) => setForm({ ...form, muscleMassKg: v })} />
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={calculating} className="btn-primary"><Activity size={16} /> {calculating ? "Calculating..." : "Calculate"}</button>
            {result && (
              <button type="button" disabled={saving} onClick={saveEntry} className="btn-secondary"><Save size={16} /> {saving ? "Saving..." : "Save entry"}</button>
            )}
          </div>
        </form>

        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <ResultTile label="BMI" value={result.bmi} sub={result.bmiCategory} />
            <ResultTile label="BMR" value={`${result.bmr}`} sub="kcal/day at rest" />
            <ResultTile label="TDEE" value={`${result.tdee}`} sub="kcal/day maintenance" />
            <ResultTile label="Body fat" value={result.bodyFatPercent ? `${result.bodyFatPercent}%` : "—"} sub={result.bodyFatCategory || "Add waist/neck to estimate"} />
          </div>
        )}

        {chartData.length > 1 && (
          <div className="glass-card mt-8 p-6">
            <h2 className="mb-4 font-display text-lg font-medium text-ink">Weight trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#0F6E5B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="glass-card mt-8 p-6">
          <h2 className="mb-4 font-display text-lg font-medium text-ink">History</h2>
          {history.length === 0 && <p className="text-sm text-ink/60">No entries yet -- calculate and save your first one above.</p>}
          <div className="divide-y divide-white/40">
            {history.map((m) => (
              <div key={m._id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{new Date(m.recordedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-ink/60">
                    {m.weightKg}kg · BMI {m.bmi} ({m.bmiCategory}) · BMR {m.bmr} · TDEE {m.tdee}
                    {m.bodyFatPercent ? ` · Body fat ${m.bodyFatPercent}%` : ""}
                  </p>
                </div>
                <button onClick={() => removeEntry(m._id)} className="text-ink/40 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" step="any" value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ResultTile({ label, value, sub }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-ink/60">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink/50">{sub}</p>
    </div>
  );
}
