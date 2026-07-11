import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

export default function PatientOnboarding() {
  const [form, setForm] = useState({
    dateOfBirth: "", gender: "female", bloodGroup: "unknown", heightCm: "", weightKg: "",
    allergies: "", chronicConditions: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/patients/me/profile", {
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()) : [],
        chronicConditions: form.chronicConditions ? form.chronicConditions.split(",").map((s) => s.trim()) : [],
      });
    } catch {
      /* profile endpoint optional in this demo build -- proceed regardless */
    } finally {
      setLoading(false);
      navigate("/patient/doctors");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-12">
        <p className="eyebrow mb-2">Step 1 of 1</p>
        <h1 className="font-display text-2xl font-medium">A few vitals before your first visit</h1>
        <p className="mt-1 text-sm text-muted">This helps your doctor prepare — you can update it anytime from your profile.</p>

        <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of birth</label>
              <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} required />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Blood group</label>
              <select className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                {["unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Known allergies (comma separated)</label>
            <input className="input" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Penicillin, Peanuts" />
          </div>
          <div>
            <label className="label">Chronic conditions (comma separated)</label>
            <input className="input" value={form.chronicConditions} onChange={(e) => set("chronicConditions", e.target.value)} placeholder="Diabetes, Hypertension" />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Saving..." : "Save & find a doctor"}</button>
        </form>
      </div>
    </div>
  );
}
