import { useEffect, useState } from "react";
import { Users, Plus, Trash2, X } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const EMPTY_FORM = { name: "", relation: "child", dateOfBirth: "", gender: "male", bloodGroup: "" };

export default function Family() {
  const [dependents, setDependents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function load() {
    api.get("/patients/me/profile").then(({ data }) => setDependents(data.profile?.dependents || []));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/patients/me/dependents", form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't add family member.");
    }
  }

  async function remove(id) {
    await api.delete(`/patients/me/dependents/${id}`);
    load();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Family</p>
        <h1 className="font-display text-2xl font-medium">Manage family members</h1>
        <p className="mt-2 text-sm text-muted">Book consults and lab tests on behalf of a family member you manage care for.</p>

        <div className="mt-6 space-y-3">
          {dependents.map((d) => (
            <div key={d._id} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted capitalize">{d.relation}{d.dateOfBirth ? ` · ${new Date(d.dateOfBirth).toLocaleDateString()}` : ""}{d.bloodGroup ? ` · ${d.bloodGroup}` : ""}</p>
              </div>
              <button onClick={() => remove(d._id)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
          {dependents.length === 0 && !showForm && (
            <div className="card p-8 text-center">
              <Users size={28} className="mx-auto text-muted" />
              <p className="mt-3 text-sm text-muted">No family members added yet.</p>
            </div>
          )}
        </div>

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 w-full">
            <Plus size={16} /> Add family member
          </button>
        ) : (
          <form onSubmit={submit} className="card mt-4 space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">New family member</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted" /></button>
            </div>
            <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input className="input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              <input className="input" placeholder="Blood group (optional)" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary w-full">Save family member</button>
          </form>
        )}
      </div>
    </div>
  );
}
