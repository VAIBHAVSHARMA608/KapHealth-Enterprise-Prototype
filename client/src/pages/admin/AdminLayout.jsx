import {
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Stethoscope,
  Package,
  MessageSquareWarning,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  PillBottle,
  Tag,
  FlaskConical,
  ClipboardList,
  Wallet,
  BarChart3,
  Dumbbell,
  Apple,
  Sparkles,
} from "lucide-react";

import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const ADMIN_ROUTE_SECRET =
  import.meta.env.VITE_ADMIN_ROUTE_SECRET ||
  "kap-ops-9f2a1c";

const base = `/${ADMIN_ROUTE_SECRET}`;

const NAV = [
  {
    to: `${base}/dashboard`,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: `${base}/doctors`,
    label: "Doctor Approvals",
    icon: Stethoscope,
  },
  {
    to: `${base}/orders`,
    label: "Orders",
    icon: Package,
  },
  {
    to: `${base}/medicines`,
    label: "Store Catalog",
    icon: PillBottle,
  },
  {
    to: `${base}/coupons`,
    label: "Coupons",
    icon: Tag,
  },
  {
    to: `${base}/lab-tests`,
    label: "Lab Test Catalog",
    icon: FlaskConical,
  },
  {
    to: `${base}/lab-bookings`,
    label: "Lab Bookings",
    icon: ClipboardList,
  },
  {
    to: `${base}/payouts`,
    label: "Doctor Payouts",
    icon: Wallet,
  },
  {
    to: `${base}/analytics`,
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: `${base}/workout-templates`,
    label: "Workout Templates",
    icon: Dumbbell,
  },
  {
    to: `${base}/foods`,
    label: "Food Catalog",
    icon: Apple,
  },
  {
    to: `${base}/wellness-tips`,
    label: "Wellness Tips",
    icon: Sparkles,
  },
  {
    to: `${base}/complaints`,
    label: "Complaints",
    icon: MessageSquareWarning,
  },
  {
    to: `${base}/faqs`,
    label: "FAQ Editor",
    icon: HelpCircle,
  },
];

export default function AdminLayout() {
  const {
    adminUser,
    adminApi,
    logoutAdmin,
  } = useAdminAuth();

  const location = useLocation();

  if (!adminUser || !adminApi) {
    return (
      <Navigate
        to={`${base}/login`}
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}

      <aside className="flex w-72 flex-col border-r border-slate-200 bg-white shadow-lg">

        {/* Logo */}

        <div className="border-b border-slate-200 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg">

              <ShieldCheck size={24} />

            </div>

            <div>

              <h1 className="text-xl font-bold">
                KapHealth
              </h1>

              <p className="text-xs uppercase tracking-widest text-emerald-600">
                ADMIN PANEL
              </p>

            </div>

          </div>

        </div>

        {/* Admin */}

        <div className="border-b border-slate-200 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-lg font-bold text-white">
              {adminUser?.name?.charAt(0).toUpperCase()}
            </div>

            <div>

              <h3 className="font-semibold">
                {adminUser?.name}
              </h3>

              <p className="text-xs text-slate-500">
                Administrator
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-2 p-4">

          {NAV.map(
            ({
              to,
              label,
              icon: Icon,
            }) => {
              const active =
                location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <Icon size={18} />

                    <span className="font-medium">
                      {label}
                    </span>

                  </div>

                  {active && (
                    <ChevronRight
                      size={18}
                    />
                  )}

                </Link>
              );
            }
          )}

        </nav>

        {/* Logout */}

        <div className="border-t border-slate-200 p-4">

          <button
            onClick={logoutAdmin}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}

      <main className="flex-1 overflow-y-auto p-8">

        <Outlet />

      </main>

    </div>
  );
}