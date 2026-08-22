import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Pediatrician",
  "Gynecologist", "Orthopedic", "Psychiatrist", "ENT Specialist", "Dentist",
  "Endocrinologist",
];

export default function DoctorOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    dateOfBirth: "", gender: "male", bloodGroup: "unknown", heightCm: "", weightKg: "",
    registrationCouncil: "", registrationNumber: "", registrationYear: "",
    qualifications: "", specializations: [], yearsOfExperience: "",
    languagesSpoken: "", clinicOrHospital: "", consultationFee: "", bio: "",
  });
  const [files, setFiles] = useState({});

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleSpecialization(s) {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter((x) => x !== s)
        : [...f.specializations, s],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("gender", form.gender);
      fd.append("bloodGroup", form.bloodGroup);
      fd.append("heightCm", form.heightCm);
      fd.append("weightKg", form.weightKg);
      fd.append("registrationCouncil", form.registrationCouncil);
      fd.append("registrationNumber", form.registrationNumber);
      fd.append("registrationYear", form.registrationYear);
      fd.append("qualifications", JSON.stringify(form.qualifications.split(",").map((s) => s.trim()).filter(Boolean)));
      fd.append("specializations", JSON.stringify(form.specializations));
      fd.append("yearsOfExperience", form.yearsOfExperience);
      fd.append("languagesSpoken", JSON.stringify(form.languagesSpoken.split(",").map((s) => s.trim()).filter(Boolean)));
      fd.append("clinicOrHospital", form.clinicOrHospital);
      fd.append("consultationFee", form.consultationFee);
      fd.append("bio", form.bio);
      Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));

      await api.post("/doctors/onboarding", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong submitting your application.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <CheckCircle2 className="mx-auto mb-4 text-primary" size={48} />
          <h1 className="font-display text-2xl font-medium">Application submitted</h1>
          <p className="mt-2 text-muted">
            Our team reviews your registration details and documents before your profile goes live for booking.
            We'll notify you on WhatsApp once it's approved.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary mt-8">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="eyebrow mb-2">Doctor onboarding</p>
        <h1 className="font-display text-2xl font-medium">Tell us about you, {user?.name?.split(" ")[0] || "doctor"}</h1>
        <p className="mt-1 text-sm text-muted">Every field here is reviewed by our team before you can accept bookings.</p>

        {error && <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent backdrop-blur-md">{error}</p>}

        <form onSubmit={submit} className="mt-8 space-y-8">
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-medium">Vital information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date of birth</label>
                <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} required />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-medium">Professional details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Medical council</label>
                <input className="input" value={form.registrationCouncil} onChange={(e) => set("registrationCouncil", e.target.value)} placeholder="Medical Council of India" required />
              </div>
              <div>
                <label className="label">Registration number</label>
                <input className="input" value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Registration year</label>
                <input type="number" className="input" value={form.registrationYear} onChange={(e) => set("registrationYear", e.target.value)} required />
              </div>
              <div>
                <label className="label">Years of experience</label>
                <input type="number" className="input" value={form.yearsOfExperience} onChange={(e) => set("yearsOfExperience", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Qualifications (comma separated)</label>
              <input className="input" value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} placeholder="MBBS, MD - General Medicine" required />
            </div>
            <div>
              <label className="label">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSpecialization(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      form.specializations.includes(s) ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Languages spoken (comma separated)</label>
                <input className="input" value={form.languagesSpoken} onChange={(e) => set("languagesSpoken", e.target.value)} placeholder="English, Hindi, Punjabi" />
              </div>
              <div>
                <label className="label">Consultation fee (₹)</label>
                <input type="number" className="input" value={form.consultationFee} onChange={(e) => set("consultationFee", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Clinic / hospital (optional)</label>
              <input className="input" value={form.clinicOrHospital} onChange={(e) => set("clinicOrHospital", e.target.value)} />
            </div>
            <div>
              <label className="label">Short bio</label>
              <textarea className="input" rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={1000} />
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-medium">Verification documents</h2>
            {[
              ["profilePhoto", "Profile photo"],
              ["governmentId", "Government ID"],
              ["medicalRegistrationCertificate", "Medical registration certificate"],
              ["degreeCertificate", "Degree certificate"],
            ].map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-line px-4 py-3 text-sm hover:border-primary">
                <span className="flex items-center gap-2 text-muted"><UploadCloud size={16} /> {label}</span>
                <span className="font-medium text-primary">{files[key]?.name || "Upload file"}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files[0] }))}
                />
              </label>
            ))}
          </section>

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </div>
    </div>
  );
}
