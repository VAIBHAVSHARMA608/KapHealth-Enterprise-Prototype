import { useEffect, useState } from "react";
import { Plus, Trash2, Apple } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const CATEGORIES = [
  "Grains & Cereals", "Protein - Meat & Eggs", "Protein - Plant", "Dairy",
  "Fruits", "Vegetables", "Nuts & Seeds", "Beverages", "Snacks", "Indian Staples",
];

const EMPTY_FORM = {
  name: "", category: "Indian Staples", servingLabel: "", calories: "",
  proteinG: "", carbsG: "", fatG: "", fiberG: "", isVeg: true,
};

export default function AdminFoods() {
  const { adminApi } = useAdminAuth();
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    adminApi.get("/foods").then(({ data }) => setFoods(data.foods));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      calories: Number(form.calories),
      proteinG: Number(form.proteinG) || 0,
      carbsG: Number(form.carbsG) || 0,
      fatG: Number(form.fatG) || 0,
      fiberG: Number(form.fiberG) || 0,
    };
    await adminApi.post("/foods", payload);
    setForm(EMPTY_FORM);
    load();
  }

  async function remove(id) {
    await adminApi.delete(`/foods/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Apple size={34} />
          <div>
            <h1 className="text-3xl font-bold">Food Catalog</h1>
            <p className="mt-2 text-white/80">Manage the nutrition database used by the calorie counter & diet planner.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold"><Plus size={20} /> Add food item</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" placeholder="Name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Serving label (e.g. 1 cup (150g))" required
            value={form.servingLabel} onChange={(e) => setForm({ ...form, servingLabel: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Calories" required
            value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Protein (g)"
            value={form.proteinG} onChange={(e) => setForm({ ...form, proteinG: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Carbs (g)"
            value={form.carbsG} onChange={(e) => setForm({ ...form, carbsG: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Fat (g)"
            value={form.fatG} onChange={(e) => setForm({ ...form, fatG: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Fiber (g)"
            value={form.fiberG} onChange={(e) => setForm({ ...form, fiberG: e.target.value })} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Vegetarian
        </label>
        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
          <Plus size={18} /> Add item
        </button>
      </form>

      <div className="space-y-3">
        {foods.map((f) => (
          <div key={f._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{f.name}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{f.category}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{f.servingLabel} · {f.calories} kcal · P{f.proteinG}g C{f.carbsG}g F{f.fatG}g</p>
            </div>
            <button onClick={() => remove(f._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
