import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const SAMPLE_PROFILE = {
  dateOfBirth: "1992-05-10",
  gender: "female",
  bloodGroup: "A+",
  heightCm: "165",
  weightKg: "60",
  allergies: "None",
  chronicConditions: "Mild asthma",
};

export default function PatientOnboarding() {
  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "female",
    bloodGroup: "unknown",
    heightCm: "",
    weightKg: "",
    allergies: "",
    chronicConditions: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const completion = useMemo(() => {
    const filled = [
      form.dateOfBirth,
      form.gender,
      form.bloodGroup !== "unknown" ? form.bloodGroup : "",
      form.heightCm,
      form.weightKg,
      form.allergies,
      form.chronicConditions,
    ].filter(Boolean).length;
    return Math.round((filled / 7) * 100);
  }, [form]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function fillSample() {
    setForm(SAMPLE_PROFILE);
    setMessage("Sample profile filled — just submit to continue.");
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.patch("/patients/me/profile", {
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()) : [],
        chronicConditions: form.chronicConditions ? form.chronicConditions.split(",").map((s) => s.trim()) : [],
      });
      navigate("/patient/dashboard");
    } catch {
      navigate("/patient/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="glass-panel p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-emerald-600">Patient onboarding</p>
              <h1 className="font-display text-3xl font-semibold text-ink">Complete your profile for a faster first visit</h1>
              <p className="mt-3 text-muted">
                Share a few simple health details and let your doctor start the consultation fully prepared.
              </p>
            </div>
            <button
              type="button"
              onClick={fillSample}
              className="btn-secondary"
            >
              Fill sample info
            </button>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted">Profile completion</p>
              <p className="font-semibold text-ink">{completion}% complete</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${completion}%` }} />
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
              {message}
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Date of birth</span>
                <input
                  type="date"
                  className="input"
                  value={form.dateOfBirth}
                  onChange={(e) => setField("dateOfBirth", e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="label">Gender</span>
                <select
                  className="input"
                  value={form.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="label">Blood group</span>
                <select
                  className="input"
                  value={form.bloodGroup}
                  onChange={(e) => setField("bloodGroup", e.target.value)}
                >
                  {["unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Height (cm)</span>
                <input
                  type="number"
                  className="input"
                  value={form.heightCm}
                  onChange={(e) => setField("heightCm", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Weight (kg)</span>
                <input
                  type="number"
                  className="input"
                  value={form.weightKg}
                  onChange={(e) => setField("weightKg", e.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Known allergies</span>
                <input
                  className="input"
                  value={form.allergies}
                  onChange={(e) => setField("allergies", e.target.value)}
                  placeholder="Penicillin, Peanuts"
                />
              </label>
              <label className="block">
                <span className="label">Chronic conditions</span>
                <input
                  className="input"
                  value={form.chronicConditions}
                  onChange={(e) => setField("chronicConditions", e.target.value)}
                  placeholder="Diabetes, Hypertension"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="font-semibold text-ink">Why this matters</p>
              <p className="mt-2 text-sm text-muted">
                Accurate health details help your doctor tailor the consultation and prescription. You can always update this information later.
              </p>
            </div>

            <button disabled={loading} className="btn-primary w-full py-4 text-base">
              {loading ? "Saving..." : "Save and continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
