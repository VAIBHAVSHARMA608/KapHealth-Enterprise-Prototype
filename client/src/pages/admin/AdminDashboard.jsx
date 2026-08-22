import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Package,
  MessageSquareWarning,
  IndianRupee,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Wallet,
  Tag,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const COLORS = ["#059669", "#0ea5e9", "#f59e0b"];

export default function AdminDashboard() {
  const { adminApi } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackStats = useMemo(
    () => ({
      pendingDoctors: 0,
      openComplaints: 0,
      ordersToday: 0,
      totalPatients: 0,
      totalDoctors: 0,
      totalRevenue: 0,
      activeMedicines: 0,
      activeCoupons: 0,
      storeOrdersToday: 0,
      pendingLabBookings: 0,
      pendingPayouts: 0,
    }),
    []
  );

  useEffect(() => {
    const canFetch = adminApi && typeof adminApi.get === "function";
    if (!canFetch) {
      setStats(fallbackStats);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      adminApi.get("/dashboard").then(({ data }) => data ?? fallbackStats).catch(() => fallbackStats),
      adminApi.get("/analytics", { params: { days: 14 } }).then(({ data }) => data).catch(() => null),
    ])
      .then(([dashboardData, analyticsData]) => {
        if (cancelled) return;
        setStats(dashboardData);
        setAnalytics(analyticsData);
      })
      .catch(() => {
        if (!cancelled) setStats(fallbackStats);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminApi, fallbackStats]);

  const safeStats = stats ?? fallbackStats;

  const cards = useMemo(
    () => [
      { label: "Pending Doctor Reviews", value: safeStats.pendingDoctors, icon: Stethoscope, color: "from-emerald-500 to-teal-500" },
      { label: "Open Complaints", value: safeStats.openComplaints, icon: MessageSquareWarning, color: "from-red-500 to-rose-500" },
      { label: "Orders Today", value: safeStats.ordersToday, icon: Package, color: "from-blue-500 to-cyan-500" },
      { label: "Total Patients", value: safeStats.totalPatients, icon: Users, color: "from-violet-500 to-indigo-500" },
      { label: "Total Doctors", value: safeStats.totalDoctors, icon: Stethoscope, color: "from-orange-500 to-amber-500" },
      { label: "Revenue", value: `₹${(safeStats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: "from-green-600 to-emerald-500" },
      { label: "Pending Lab Bookings", value: safeStats.pendingLabBookings, icon: FlaskConical, color: "from-sky-500 to-blue-500" },
      { label: "Pending Payouts", value: safeStats.pendingPayouts, icon: Wallet, color: "from-fuchsia-500 to-purple-500" },
      { label: "Active Catalog Items", value: (safeStats.activeMedicines || 0) + (safeStats.activeCoupons || 0), icon: Tag, color: "from-lime-500 to-green-500" },
    ],
    [safeStats]
  );

  // Relative links -- resolve against whatever the admin route secret is
  // right now, instead of a hardcoded path that breaks if it's customized.
  const quickActions = [
    { label: "Approve doctors", to: "doctors", icon: ShieldCheck },
    { label: "Review orders", to: "orders", icon: Package },
    { label: "Track lab bookings", to: "lab-bookings", icon: Sparkles },
    { label: "Open full analytics", to: "analytics", icon: ArrowRight },
  ];

  const revenuePie = analytics
    ? [
        { name: "Appointments", value: analytics.revenueBreakdown.appointments },
        { name: "Medicine orders", value: analytics.revenueBreakdown.orders },
        { name: "Lab tests", value: analytics.revenueBreakdown.labTests },
      ]
    : [];

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Activity size={42} className="mx-auto animate-pulse text-emerald-600" />
          <p className="mt-4 text-slate-500">Loading admin insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <h1 className="relative text-3xl font-bold">Admin Dashboard</h1>
        <p className="relative mt-2 text-white/80">Welcome back 👋 Manage KapHealth from one place.</p>

        <div className="relative mt-6 flex flex-wrap gap-3">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/25"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${color} text-white shadow-lg`}>
              <Icon size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{value}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Revenue -- last 14 days</h2>
              <Link to="analytics" className="text-sm font-medium text-emerald-700 hover:underline">Full analytics →</Link>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.revenueByDay}>
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Revenue by source</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={revenuePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {revenuePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {analytics?.topDoctors?.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top doctors by earnings</h2>
          <div className="space-y-3">
            {analytics.topDoctors.map((d, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">
                <span className="font-medium text-slate-700">{i + 1}. {d.doctorName}</span>
                <span className="text-slate-500">₹{d.earnings} · {d.consults} consults</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
