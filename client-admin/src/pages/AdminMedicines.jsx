import { useEffect, useState } from "react";
import { Plus, Trash2, Package, Pencil, X } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const CATEGORIES = [
  "Pain Relief", "Fever & Cold", "Digestive Care", "Diabetes Care", "Cardiac Care",
  "Vitamins & Supplements", "First Aid", "Baby Care", "Personal Care", "Skin Care",
  "Devices & Essentials", "Sexual Wellness", "Ayurveda & Herbal",
];

const EMPTY_FORM = {
  name: "", genericName: "", manufacturer: "", unit: "strip", mrp: "", sellingPrice: "",
  requiresPrescription: false, stockQuantity: "", category: "Devices & Essentials", description: "",
};

export default function AdminMedicines() {
  const { adminApi } = useAdminAuth();
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  function load() {
    adminApi.get("/medicines").then(({ data }) => setMedicines(data.medicines));
  }

  useEffect(load, []);

  function startEdit(med) {
    setEditingId(med._id);
    setForm({
      name: med.name, genericName: med.genericName || "", manufacturer: med.manufacturer || "",
      unit: med.unit, mrp: med.mrp, sellingPrice: med.sellingPrice,
      requiresPrescription: med.requiresPrescription, stockQuantity: med.stockQuantity,
      category: med.category, description: med.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, mrp: Number(form.mrp), sellingPrice: Number(form.sellingPrice), stockQuantity: Number(form.stockQuantity) };
    if (editingId) {
      await adminApi.patch(`/medicines/${editingId}`, payload);
    } else {
      await adminApi.post("/medicines", payload);
    }
    cancelEdit();
    load();
  }

  async function deactivate(id) {
    await adminApi.delete(`/medicines/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Package size={34} />
          <div>
            <h1 className="text-3xl font-bold">Store Catalog</h1>
            <p className="mt-2 text-white/80">Manage prescription drugs and OTC essentials sold on the store.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          {editingId ? <Pencil size={20} /> : <Plus size={20} />}
          {editingId ? "Edit item" : "Add new item"}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" placeholder="Name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Generic name"
            value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Manufacturer"
            value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Unit (e.g. strip of 10)"
            value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="MRP" required
            value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Selling price" required
            value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Stock quantity"
            value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
        </div>

        <textarea rows={2} className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={form.requiresPrescription}
            onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })} />
          Requires a doctor's prescription
        </label>

        <div className="mt-5 flex gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
            {editingId ? <Pencil size={18} /> : <Plus size={18} />} {editingId ? "Save changes" : "Add item"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="flex items-center gap-2 rounded-xl border px-6 py-3 font-medium text-slate-600 hover:bg-slate-50">
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {medicines.map((med) => (
          <div key={med._id} className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!med.isActive ? "opacity-50" : ""}`}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-800">{med.name}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{med.category}</span>
                {med.requiresPrescription && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Rx required</span>}
                {!med.isActive && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">₹{med.sellingPrice} (MRP ₹{med.mrp}) · Stock: {med.stockQuantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(med)} className="rounded-xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200">
                <Pencil size={18} />
              </button>
              {med.isActive && (
                <button onClick={() => deactivate(med._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
