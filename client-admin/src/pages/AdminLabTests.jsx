import { useEffect, useState } from "react";
import { Plus, Trash2, FlaskConical, Pencil, X } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const CATEGORIES = [
  "Full Body Checkup", "Diabetes", "Thyroid", "Liver", "Kidney", "Cardiac",
  "Vitamin & Mineral", "Hormone", "COVID-19", "Cancer Screening", "Women's Health", "Men's Health", "General Blood Work",
];

const EMPTY_FORM = {
  name: "", category: "General Blood Work", description: "", sampleType: "Blood",
  fastingRequired: false, reportTimeHours: 24, mrp: "", price: "", parametersCovered: "",
};

export default function AdminLabTests() {
  const { adminApi } = useAdminAuth();
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  function load() {
    adminApi.get("/lab-tests").then(({ data }) => setTests(data.tests));
  }

  useEffect(load, []);

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      name: t.name, category: t.category, description: t.description || "", sampleType: t.sampleType,
      fastingRequired: t.fastingRequired, reportTimeHours: t.reportTimeHours, mrp: t.mrp, price: t.price,
      parametersCovered: t.parametersCovered || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      mrp: Number(form.mrp),
      price: Number(form.price),
      reportTimeHours: Number(form.reportTimeHours),
      parametersCovered: form.parametersCovered ? Number(form.parametersCovered) : undefined,
    };
    if (editingId) await adminApi.patch(`/lab-tests/${editingId}`, payload);
    else await adminApi.post("/lab-tests", payload);
    cancelEdit();
    load();
  }

  async function deactivate(id) {
    await adminApi.delete(`/lab-tests/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <FlaskConical size={34} />
          <div>
            <h1 className="text-3xl font-bold">Lab Test Catalog</h1>
            <p className="mt-2 text-white/80">Manage diagnostic tests available for home sample collection.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          {editingId ? <Pencil size={20} /> : <Plus size={20} />} {editingId ? "Edit test" : "Add new test"}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" placeholder="Test name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.sampleType} onChange={(e) => setForm({ ...form, sampleType: e.target.value })}>
            {["Blood", "Urine", "Swab", "Saliva", "Stool", "None"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Report time (hours)"
            value={form.reportTimeHours} onChange={(e) => setForm({ ...form, reportTimeHours: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Parameters covered (optional)"
            value={form.parametersCovered} onChange={(e) => setForm({ ...form, parametersCovered: e.target.value })} />

          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="MRP" required
            value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Price" required
            value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>

        <textarea rows={2} className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={form.fastingRequired} onChange={(e) => setForm({ ...form, fastingRequired: e.target.checked })} />
          Fasting required
        </label>

        <div className="mt-5 flex gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
            {editingId ? <Pencil size={18} /> : <Plus size={18} />} {editingId ? "Save changes" : "Add test"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="flex items-center gap-2 rounded-xl border px-6 py-3 font-medium text-slate-600 hover:bg-slate-50">
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t._id} className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!t.isActive ? "opacity-50" : ""}`}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-800">{t.name}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{t.category}</span>
                {t.fastingRequired && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Fasting</span>}
                {!t.isActive && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">₹{t.price} (MRP ₹{t.mrp}) · {t.sampleType} sample · Report in {t.reportTimeHours}h</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(t)} className="rounded-xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"><Pencil size={18} /></button>
              {t.isActive && (
                <button onClick={() => deactivate(t._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white"><Trash2 size={18} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
