import { useEffect, useState } from "react";
import { Users, Stethoscope, Package, MessageSquareWarning, IndianRupee } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminDashboard() {
  const { adminApi } = useAdminAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { adminApi.get("/dashboard").then(({ data }) => setStats(data)); }, [adminApi]);

  if (!stats) return <p className="text-muted">Loading dashboard...</p>;

  const cards = [
    { label: "Pending doctor reviews", value: stats.pendingDoctors, icon: Stethoscope },
    { label: "Open complaints", value: stats.openComplaints, icon: MessageSquareWarning },
    { label: "Orders today", value: stats.ordersToday, icon: Package },
    { label: "Total patients", value: stats.totalPatients, icon: Users },
    { label: "Total doctors", value: stats.totalDoctors, icon: Stethoscope },
    { label: "Total revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <Icon className="mb-3 text-primary" size={20} />
            <p className="font-display text-2xl font-medium">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
