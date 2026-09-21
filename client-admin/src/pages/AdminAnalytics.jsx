import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminAnalytics() {
  const { adminApi } = useAdminAuth();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    adminApi.get("/analytics", { params: { days } }).then(({ data }) => setData(data));
  }, [days]);

  if (!data) return <p className="text-slate-500">Loading analytics...</p>;

  const revenuePie = [
    { name: "Appointments", value: data.revenueBreakdown.appointments },
    { name: "Medicine orders", value: data.revenueBreakdown.orders },
    { name: "Lab tests", value: data.revenueBreakdown.labTests },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BarChart3 size={34} />
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="mt-2 text-white/80">Revenue, growth, and top-performing doctors at a glance.</p>
            </div>
          </div>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-xl border-0 bg-white/20 px-4 py-2 text-sm font-medium text-white">
            <option value={7} className="text-slate-900">Last 7 days</option>
            <option value={30} className="text-slate-900">Last 30 days</option>
            <option value={90} className="text-slate-900">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Revenue over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.revenueByDay}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Revenue by source</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={revenuePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {revenuePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Appointments booked per day</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.appointmentsByDay}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top doctors by earnings</h2>
          <div className="space-y-3">
            {data.topDoctors.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{i + 1}. {d.doctorName}</span>
                <span className="text-slate-500">₹{d.earnings} · {d.consults} consults</span>
              </div>
            ))}
            {data.topDoctors.length === 0 && <p className="text-sm text-slate-500">No completed consultations yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
