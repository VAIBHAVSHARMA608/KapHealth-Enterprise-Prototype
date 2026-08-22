import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Wallet, CalendarClock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const PAYOUT_TONE = { pending: "pending", processing: "processing", paid: "success", failed: "danger" };

export default function DoctorEarnings() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/doctors/me/earnings").then(({ data }) => setData(data));
  }, []);

  if (!data) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading...</p></div>;

  const chartData = data.recentAppointments
    .slice()
    .reverse()
    .map((a) => ({ date: new Date(a.scheduledStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }), fee: a.consultationFee }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="eyebrow mb-2">Earnings</p>
        <h1 className="font-display text-3xl font-medium">Your earnings & payouts</h1>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={IndianRupee} label="Total earned" value={`₹${data.totalEarned}`} sub={`${data.totalConsultations} consults`} />
          <StatCard icon={TrendingUp} label="This week" value={`₹${data.thisWeek.earned}`} sub={`${data.thisWeek.count} consults`} />
          <StatCard icon={CalendarClock} label="This month" value={`₹${data.thisMonth.earned}`} sub={`${data.thisMonth.count} consults`} />
          <StatCard icon={Wallet} label="Est. pending payout" value={`₹${data.estimatedPendingPayout}`} sub="after platform fee" />
        </div>

        {chartData.length > 0 && (
          <div className="card mt-6 p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Recent consultation fees</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="fee" stroke="#0F6E5B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card mt-6 p-6">
          <h2 className="mb-4 font-display text-lg font-medium">Payout history</h2>
          {data.payouts.length === 0 && <p className="text-sm text-muted">No payouts processed yet.</p>}
          <div className="divide-y divide-line">
            {data.payouts.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</p>
                  <p className="text-xs text-muted">{p.consultationCount} consults · ₹{p.grossAmount} gross · {p.platformFeePercent}% fee</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">₹{p.netAmount}</p>
                  <StatusBadge tone={PAYOUT_TONE[p.status]}>{p.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-4">
      <Icon size={18} className="text-primary" />
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="font-mono text-xl font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{sub}</p>
    </div>
  );
}
