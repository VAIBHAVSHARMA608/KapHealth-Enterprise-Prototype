import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Stethoscope, Package, MessageSquareWarning, HelpCircle, LogOut } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const ADMIN_ROUTE_SECRET = import.meta.env.VITE_ADMIN_ROUTE_SECRET || "kap-ops-9f2a1c";
const base = `/${ADMIN_ROUTE_SECRET}`;

const NAV = [
  { to: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
  { to: `${base}/doctors`, label: "Doctor approvals", icon: Stethoscope },
  { to: `${base}/orders`, label: "Orders", icon: Package },
  { to: `${base}/complaints`, label: "Complaints", icon: MessageSquareWarning },
  { to: `${base}/faqs`, label: "FAQ editor", icon: HelpCircle },
];

export default function AdminLayout() {
  const { adminUser, adminApi, logoutAdmin } = useAdminAuth();
  const location = useLocation();

  if (!adminUser || !adminApi) {
    return <Navigate to={`${base}/login`} state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white p-4">
        <p className="mb-6 px-2 font-display text-lg font-medium text-ink">KapHealth <span className="text-primary">Ops</span></p>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-primary-light hover:text-primary-dark">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={logoutAdmin} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600">
          <LogOut size={16} /> Log out
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
