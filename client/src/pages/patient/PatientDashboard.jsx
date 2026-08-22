import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  ShoppingBag,
  FlaskConical,
  Video,
  Heart,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  Package,
  Clock3,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [labBookings, setLabBookings] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [vaultCount, setVaultCount] = useState(0);

  useEffect(() => {
    api.get("/appointments").then(({ data }) => setAppointments(data.appointments || [])).catch(() => {});
    api.get("/orders").then(({ data }) => setOrders(data.orders || [])).catch(() => {});
    api.get("/lab-tests/bookings/mine").then(({ data }) => setLabBookings(data.bookings || [])).catch(() => {});
    api.get("/store/wishlist").then(({ data }) => setWishlistCount((data.medicines || []).length)).catch(() => {});
    api.get("/health-records").then(({ data }) => setVaultCount((data.records || []).length)).catch(() => {});
  }, []);

  const upcoming = useMemo(
    () => appointments.find((a) => ["confirmed", "in_progress", "pending_payment"].includes(a.status)),
    [appointments]
  );

  const activeOrders = orders.filter((o) => !["delivered", "cancelled", "returned"].includes(o.status)).length;
  const activeLabBookings = labBookings.filter((b) => b.status !== "report_ready" && b.status !== "cancelled").length;
  const firstName = user?.name?.split(" ")[0] || "there";

  const promos = [
    {
      title: "Talk to a doctor now",
      blurb: "Video consults in minutes, from home.",
      cta: "Find a doctor",
      to: "/patient/doctors",
      icon: Stethoscope,
      className: "gradient-hero",
    },
    {
      title: "Essentials, delivered",
      blurb: "Vitamins, first aid & more — no prescription needed.",
      cta: "Shop the store",
      to: "/patient/store",
      icon: ShoppingBag,
      className: "gradient-accent",
    },
    {
      title: "Lab tests at home",
      blurb: "A phlebotomist comes to you. Reports in 24h.",
      cta: "Book a test",
      to: "/patient/lab-tests",
      icon: FlaskConical,
      className: "bg-gradient-to-br from-sky-600 to-indigo-600",
    },
    {
      title: "Diet & workout planner",
      blurb: "Calculators, meal plans & programs for 14+ sports.",
      cta: "Open Wellness",
      to: "/patient/wellness",
      icon: Sparkles,
      className: "bg-gradient-to-br from-fuchsia-600 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="gradient-hero relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 right-32 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <p className="eyebrow text-white/70">Your health, in one place</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Hi {firstName}, how can we help today?</h1>
            <p className="mt-3 max-w-xl text-white/85">
              Book a doctor, order your medicines, run a lab test, or check in on your family — all from one dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/patient/doctors" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-dark shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <Video size={16} /> Book a consult
              </Link>
              <Link to="/patient/store" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25">
                <ShoppingBag size={16} /> Browse essentials
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming appointment strip */}
        {upcoming && (
          <Link
            to={`/patient/appointments/${upcoming._id}`}
            className="card-hover mt-6 flex flex-col items-start justify-between gap-4 rounded-[2rem] border border-primary/20 bg-primary-light p-6 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white"><Clock3 size={22} /></div>
              <div>
                <p className="text-sm font-semibold text-primary-dark">Upcoming: Dr. {upcoming.doctor?.name}</p>
                <p className="text-sm text-ink/70">{new Date(upcoming.scheduledStart).toLocaleString()}</p>
              </div>
            </div>
            <span className="btn-secondary !py-2">View details <ArrowRight size={14} /></span>
          </Link>
        )}

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile icon={Package} label="Active orders" value={activeOrders} to="/patient/orders" />
          <StatTile icon={FlaskConical} label="Lab bookings" value={activeLabBookings} to="/patient/lab-bookings" />
          <StatTile icon={Heart} label="Wishlist" value={wishlistCount} to="/patient/wishlist" />
          <StatTile icon={FileText} label="Health vault" value={vaultCount} to="/patient/health-vault" />
        </div>

        {/* Promo cards -- eye-catching cross-promotion of every part of the app */}
        <div className="mt-10">
          <p className="eyebrow mb-4 flex items-center gap-2"><Sparkles size={14} /> Explore KapHealth</p>
          <div className="grid gap-5 md:grid-cols-3">
            {promos.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className={`card-hover group relative overflow-hidden rounded-3xl p-6 text-white shadow-lg ${p.className}`}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl transition group-hover:scale-125" />
                <p.icon size={28} className="relative" />
                <h3 className="relative mt-4 font-display text-xl font-semibold">{p.title}</h3>
                <p className="relative mt-1.5 text-sm text-white/85">{p.blurb}</p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  {p.cta} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Family + recent activity */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow flex items-center gap-2"><Users size={14} /> Family</p>
              <Link to="/patient/family" className="text-xs font-semibold text-primary hover:underline">Manage</Link>
            </div>
            <p className="mt-3 text-sm text-muted">Book consults and lab tests on behalf of family members you care for.</p>
            <Link to="/patient/family" className="btn-secondary mt-4 !py-2 text-xs">Add a family member</Link>
          </div>

          <div className="card p-6">
            <p className="eyebrow mb-3">Recent orders</p>
            {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
            <div className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <Link key={o._id} to={`/patient/orders/${o._id}`} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm transition hover:bg-surface">
                  <span>{o.orderNumber}</span>
                  <span className="text-xs capitalize text-muted">{o.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="stat-tile flex flex-col items-start">
      <Icon size={18} className="text-primary" />
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Link>
  );
}
