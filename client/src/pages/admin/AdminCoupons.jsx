import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Power } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const EMPTY_FORM = {
  code: "", description: "", discountType: "flat", discountValue: "", maxDiscount: "",
  minOrderValue: "0", usageLimit: "", expiresAt: "",
};

export default function AdminCoupons() {
  const { adminApi } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    adminApi.get("/coupons").then(({ data }) => setCoupons(data.coupons));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || undefined,
    };
    await adminApi.post("/coupons", payload);
    setForm(EMPTY_FORM);
    load();
  }

  async function toggleActive(coupon) {
    await adminApi.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    load();
  }

  async function remove(id) {
    await adminApi.delete(`/coupons/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Tag size={34} />
          <div>
            <h1 className="text-3xl font-bold">Coupons</h1>
            <p className="mt-2 text-white/80">Create and manage discount codes for the OTC store.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <Plus size={20} /> Create coupon
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border p-3 uppercase outline-none focus:border-emerald-500" placeholder="CODE" required
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="flat">Flat amount (₹)</option>
            <option value="percent">Percentage (%)</option>
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Discount value" required
            value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />

          {form.discountType === "percent" && (
            <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Max discount cap (₹)"
              value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
          )}
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Min order value"
            value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="number" placeholder="Usage limit (blank = unlimited)"
            value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="date"
            value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </div>

        <textarea rows={2} className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
          <Plus size={18} /> Create coupon
        </button>
      </form>

      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c._id} className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!c.isActive ? "opacity-50" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-slate-800">{c.code}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {c.discountType === "flat" ? `₹${c.discountValue} off` : `${c.discountValue}% off`}
                </span>
                {!c.isActive && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">{c.description}</p>
              <p className="mt-1 text-xs text-slate-400">
                Min order ₹{c.minOrderValue} · Used {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(c)} className="rounded-xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200">
                <Power size={18} />
              </button>
              <button onClick={() => remove(c._id)} className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
