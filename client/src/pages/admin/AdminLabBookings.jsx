import { useEffect, useState } from "react";
import { FlaskConical, FileText } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const STATUSES = ["booked", "sample_collected", "processing", "report_ready", "cancelled"];

export default function AdminLabBookings() {
  const { adminApi } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");
  const [reportUrls, setReportUrls] = useState({});

  function load() {
    adminApi.get("/lab-bookings", { params: filter ? { status: filter } : {} }).then(({ data }) => setBookings(data.bookings));
  }

  useEffect(load, [filter]);

  async function updateStatus(id, status) {
    await adminApi.patch(`/lab-bookings/${id}/status`, { status, reportUrl: reportUrls[id] || undefined });
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <FlaskConical size={34} />
          <div>
            <h1 className="text-3xl font-bold">Lab Bookings</h1>
            <p className="mt-2 text-white/80">Track sample collection through to report delivery.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full border px-4 py-1.5 text-xs font-medium ${!filter ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${filter === s ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">{b.bookingNumber} · {b.patient?.name}</h3>
                <p className="text-sm text-slate-500">{b.tests.map((t) => t.name).join(", ")}</p>
                <p className="text-xs text-slate-400">{new Date(b.scheduledDate).toLocaleDateString()} · {b.timeSlot} · ₹{b.total}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{b.status.replace(/_/g, " ")}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(b._id, s)}
                  disabled={b.status === s}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium capitalize text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
              <div className="flex flex-1 items-center gap-2">
                <FileText size={14} className="text-slate-400" />
                <input
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                  placeholder="Report URL (paste link, then set status to Report ready)"
                  value={reportUrls[b._id] ?? b.reportUrl ?? ""}
                  onChange={(e) => setReportUrls({ ...reportUrls, [b._id]: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings found.</p>}
      </div>
    </div>
  );
}
