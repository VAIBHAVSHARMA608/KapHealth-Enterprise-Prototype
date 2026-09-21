import { useEffect, useState } from "react";
import { Plus, Trash2, Sparkles, Power } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const CATEGORIES = ["nutrition", "workout", "recovery", "hydration", "sleep", "mindset"];
const EMPTY_FORM = { category: "nutrition", title: "", body: "" };

export default function AdminWellnessTips() {
  const { adminApi } = useAdminAuth();
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    adminApi.get("/wellness-tips").then(({ data }) => setTips(data.tips));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    await adminApi.post("/wellness-tips", form);
    setForm(EMPTY_FORM);
    load();
  }

  async function toggleActive(tip) {
    await adminApi.patch(`/wellness-tips/${tip._id}`, { isActive: !tip.isActive });
    load();
  }

  async function remove(id) {
    await adminApi.delete(`/wellness-tips/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Sparkles size={34} />
          <div>
            <h1 className="text-3xl font-bold">Wellness Tips</h1>
            <p className="mt-2 text-white/80">Manage the tips & tricks feed patients see in Wellness.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold"><Plus size={20} /> Add tip</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" placeholder="Title" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <textarea rows={3} className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Body" required
          value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
          <Plus size={18} /> Add tip
        </button>
      </form>

      <div className="space-y-3">
        {tips.map((t) => (
          <div key={t._id} className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!t.isActive ? "opacity-50" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{t.title}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700">{t.category}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t.body}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => toggleActive(t)} className="rounded-xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"><Power size={18} /></button>
              <button onClick={() => remove(t._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
