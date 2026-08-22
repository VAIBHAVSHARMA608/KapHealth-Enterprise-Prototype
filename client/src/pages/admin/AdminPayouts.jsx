import { useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import api from "../../services/api.js";

const STATUSES = ["pending", "processing", "paid", "failed"];

export default function AdminPayouts() {
  const { adminApi } = useAdminAuth();
  const [payouts, setPayouts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: "", periodStart: "", periodEnd: "", platformFeePercent: 15 });
  const [transactionRefs, setTransactionRefs] = useState({});
  const [error, setError] = useState("");

  function load() {
    adminApi.get("/payouts").then(({ data }) => setPayouts(data.payouts));
  }

  useEffect(() => {
    load();
    api.get("/doctors").then(({ data }) => setDoctors(data.doctors));
  }, []);

  async function generate(e) {
    e.preventDefault();
    setError("");
    try {
      await adminApi.post("/payouts", form);
      setForm({ doctorId: "", periodStart: "", periodEnd: "", platformFeePercent: 15 });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate payout.");
    }
  }

  async function updateStatus(id, status) {
    await adminApi.patch(`/payouts/${id}`, { status, transactionRef: transactionRefs[id] });
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Wallet size={34} />
          <div>
            <h1 className="text-3xl font-bold">Doctor Payouts</h1>
            <p className="mt-2 text-white/80">Generate and settle weekly/monthly payouts for consultation earnings.</p>
          </div>
        </div>
      </div>

      <form onSubmit={generate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold"><Plus size={20} /> Generate payout</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <select className="rounded-xl border p-3 outline-none focus:border-emerald-500 md:col-span-2" required
            value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
            <option value="">Select doctor</option>
            {doctors.map((d) => <option key={d.user._id} value={d.user._id}>{d.user.name}</option>)}
          </select>
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="date" required
            value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
          <input className="rounded-xl border p-3 outline-none focus:border-emerald-500" type="date" required
            value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">
          <Plus size={18} /> Generate payout
        </button>
      </form>

      <div className="space-y-3">
        {payouts.map((p) => (
          <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">{p.doctor?.name}</h3>
                <p className="text-sm text-slate-500">{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()} · {p.consultationCount} consults</p>
                <p className="text-xs text-slate-400">Gross ₹{p.grossAmount} · Fee {p.platformFeePercent}% (₹{p.platformFee}) · Net <span className="font-semibold text-slate-600">₹{p.netAmount}</span></p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{p.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(p._id, s)} disabled={p.status === s}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium capitalize text-slate-600 transition hover:bg-slate-50 disabled:opacity-30">
                  {s}
                </button>
              ))}
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                placeholder="Transaction reference (for 'paid')"
                value={transactionRefs[p._id] ?? p.transactionRef ?? ""}
                onChange={(e) => setTransactionRefs({ ...transactionRefs, [p._id]: e.target.value })}
              />
            </div>
          </div>
        ))}
        {payouts.length === 0 && <p className="text-sm text-slate-500">No payouts generated yet.</p>}
      </div>
    </div>
  );
}
