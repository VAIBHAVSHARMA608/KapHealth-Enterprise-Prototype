import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  Heart,
  HeartPulse,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

const PROMO_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85";

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85";

function ThreeDStat({ icon: Icon, label, value, to, tone = "primary" }) {
  return (
    <Link
      to={to}
      className={`dashboard-stat parent parent-${tone}`}
    >
      <div className="dashboard-stat-card">
        <div className="dashboard-stat-glass" />

        <div className="dashboard-stat-logo" aria-hidden="true">
          <span className="dashboard-circle dashboard-circle-1" />
          <span className="dashboard-circle dashboard-circle-2" />
          <span className="dashboard-circle dashboard-circle-3" />
          <span className="dashboard-circle dashboard-circle-4" />
          <span className="dashboard-circle dashboard-circle-5">
            <Icon size={17} />
          </span>
        </div>

        <div className="dashboard-stat-content">
          <span className="dashboard-stat-title">{label}</span>
          <span className="dashboard-stat-value">{value}</span>
          <span className="dashboard-stat-copy">Open details</span>
        </div>

        <div className="dashboard-stat-bottom">
          <span className="dashboard-stat-dot">
            <span />
          </span>
          <span className="dashboard-stat-arrow">
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`quick-action ${item.theme} group`}
    >
      <div className="quick-action-glow" />
      <div className="quick-action-icon">
        <Icon size={23} />
      </div>

      <div className="quick-action-copy">
        <span className="quick-action-kicker">{item.kicker}</span>
        <h3>{item.title}</h3>
        <p>{item.blurb}</p>
      </div>

      <span className="quick-action-arrow">
        <ArrowRight size={16} />
      </span>

      <span className="quick-action-shine" />
    </Link>
  );
}

function ActivityRow({ order }) {
  return (
    <Link
      to={`/patient/orders/${order._id}`}
      className="activity-row group"
    >
      <div className="activity-icon">
        <Package size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">
          {order.orderNumber}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-400">
          {order.status.replace(/_/g, " ")}
        </p>
      </div>

      <span className="font-mono text-xs font-semibold text-slate-700">
        ₹{order.total}
      </span>

      <ChevronRight
        size={14}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

function HealthPulseBanner() {
  return (
    <section className="dashboard-promo group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
      <div className="absolute inset-0">
        <img
          src={PROMO_IMAGE}
          alt="Healthcare consultation"
          className="h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/15" />
      </div>

      <div className="relative z-10 min-h-[270px] p-7 sm:p-9 lg:min-h-[300px]">
        <div className="flex h-full max-w-3xl flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                KapHealth care network
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] text-white/45">
                <ShieldCheck size={11} className="text-emerald-300" />
                Secure by design
              </span>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200/70">
              Your health, intelligently connected
            </p>

            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              One dashboard for doctors, diagnostics, medicines and family care.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
              Move from a consultation to a prescription, from a lab test to a
              health record, without losing the thread.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/patient/doctors"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Video size={14} />
              Book a consult
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/patient/lab-tests"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <FlaskConical size={14} />
              Book lab tests
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 hidden w-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 shadow-2xl backdrop-blur-md lg:block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={PROMO_IMAGE}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <HeartPulse size={15} />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-white">
                Connected care
              </p>
              <p className="text-[9px] text-white/40">
                From symptom to follow-up
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [labBookings, setLabBookings] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [vaultCount, setVaultCount] = useState(0);
  const [familyCount, setFamilyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get("/appointments"),
        api.get("/orders"),
        api.get("/lab-tests/bookings/mine"),
        api.get("/store/wishlist"),
        api.get("/health-records"),
        api.get("/patients/me/profile"),
      ]);

      if (!mounted) return;

      const [
        appointmentResult,
        orderResult,
        labResult,
        wishlistResult,
        vaultResult,
        profileResult,
      ] = results;

      if (appointmentResult.status === "fulfilled") {
        setAppointments(
          appointmentResult.value.data.appointments || []
        );
      }

      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value.data.orders || []);
      }

      if (labResult.status === "fulfilled") {
        setLabBookings(
          labResult.value.data.bookings || []
        );
      }

      if (wishlistResult.status === "fulfilled") {
        setWishlistCount(
          (wishlistResult.value.data.medicines || []).length
        );
      }

      if (vaultResult.status === "fulfilled") {
        setVaultCount(
          (vaultResult.value.data.records || []).length
        );
      }

      if (profileResult.status === "fulfilled") {
        setFamilyCount(
          (profileResult.value.data.profile?.dependents || []).length
        );
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const upcoming = useMemo(
    () =>
      appointments.find((appointment) =>
        ["confirmed", "in_progress", "pending_payment"].includes(
          appointment.status
        )
      ),
    [appointments]
  );

  const activeOrders = orders.filter(
    (order) =>
      !["delivered", "cancelled", "returned"].includes(order.status)
  ).length;

  const activeLabBookings = labBookings.filter(
    (booking) =>
      booking.status !== "report_ready" &&
      booking.status !== "cancelled"
  ).length;

  const firstName =
    user?.name?.split(" ")[0] || "there";

  const quickActions = [
    {
      title: "Talk to a doctor",
      kicker: "Virtual care",
      blurb: "Verified specialists, secure video consultations, from home.",
      to: "/patient/doctors",
      icon: Stethoscope,
      theme: "quick-action-green",
    },
    {
      title: "Order essentials",
      kicker: "Pharmacy",
      blurb: "Everyday healthcare essentials delivered to your doorstep.",
      to: "/patient/store",
      icon: ShoppingBag,
      theme: "quick-action-coral",
    },
    {
      title: "Run a lab test",
      kicker: "Diagnostics",
      blurb: "Book at-home collection and track the report from your dashboard.",
      to: "/patient/lab-tests",
      icon: FlaskConical,
      theme: "quick-action-blue",
    },
    {
      title: "Improve your wellness",
      kicker: "Wellness",
      blurb: "Diet plans, calorie tracking, AI reviews and daily health tools.",
      to: "/patient/wellness",
      icon: Sparkles,
      theme: "quick-action-violet",
    },
  ];

  return (
    <div className="patient-dashboard min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .patient-dashboard {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 94% 25%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .patient-dashboard::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .35;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        /* Uiverse-inspired 3D stat system */
        .dashboard-stat {
          display: block;
          min-height: 190px;
          perspective: 1000px;
          text-decoration: none;
        }

        .dashboard-stat-card {
          position: relative;
          height: 190px;
          overflow: hidden;
          border-radius: 28px;
          background: linear-gradient(135deg, #0f6e5b, #08dca0);
          transform-style: preserve-3d;
          box-shadow:
            rgba(5, 71, 17, 0) 40px 50px 25px -40px,
            rgba(5, 71, 17, .12) 0 25px 28px -5px;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .dashboard-stat-glass {
          position: absolute;
          inset: 8px;
          border-radius: 31px 31px 31px 70px;
          border-left: 1px solid rgba(255,255,255,.65);
          border-bottom: 1px solid rgba(255,255,255,.65);
          background: linear-gradient(
            0deg,
            rgba(255,255,255,.15) 0%,
            rgba(255,255,255,.68) 100%
          );
          transform: translate3d(0,0,25px);
          transform-style: preserve-3d;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .dashboard-stat-content {
          position: relative;
          z-index: 5;
          padding: 62px 28px 0;
          transform: translate3d(0,0,27px);
          color: #074f40;
          transition: transform .5s cubic-bezier(.22,1,.36,1);
        }

        .dashboard-stat-title {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .15em;
          opacity: .64;
        }

        .dashboard-stat-value {
          display: block;
          margin-top: 6px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
        }

        .dashboard-stat-copy {
          display: block;
          margin-top: 8px;
          font-size: 10px;
          font-weight: 700;
          opacity: .58;
        }

        .dashboard-stat-bottom {
          position: absolute;
          z-index: 8;
          right: 20px;
          bottom: 19px;
          left: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translate3d(0,0,28px);
        }

        .dashboard-stat-dot {
          display: flex;
          width: 26px;
          height: 12px;
          align-items: center;
        }

        .dashboard-stat-dot span {
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #08765f;
          box-shadow: 0 0 0 5px rgba(8,118,95,.08);
        }

        .dashboard-stat-arrow {
          display: flex;
          width: 31px;
          height: 31px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.72);
          color: #0f6e5b;
          box-shadow: rgba(5,71,17,.22) 0 7px 5px -5px;
          transition: transform .2s ease-in-out, box-shadow .2s ease-in-out;
        }

        .dashboard-stat-logo {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 7;
          transform-style: preserve-3d;
        }

        .dashboard-circle {
          position: absolute;
          top: 0;
          right: 0;
          display: block;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(0,249,203,.18);
          box-shadow: rgba(100,100,111,.16) -10px 10px 20px 0;
          backdrop-filter: blur(5px);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .dashboard-circle-1 {
          width: 142px;
          transform: translate3d(0,0,20px);
          top: 7px;
          right: 7px;
        }

        .dashboard-circle-2 {
          width: 116px;
          transform: translate3d(0,0,40px);
          top: 9px;
          right: 9px;
          transition-delay: .08s;
        }

        .dashboard-circle-3 {
          width: 90px;
          transform: translate3d(0,0,60px);
          top: 15px;
          right: 15px;
          transition-delay: .14s;
        }

        .dashboard-circle-4 {
          width: 64px;
          transform: translate3d(0,0,80px);
          top: 20px;
          right: 20px;
          transition-delay: .2s;
        }

        .dashboard-circle-5 {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          transform: translate3d(0,0,100px);
          top: 25px;
          right: 25px;
          background: rgba(255,255,255,.16);
          color: white;
          transition-delay: .26s;
        }

        .parent:hover .dashboard-stat-card {
          transform: rotate3d(1,1,0,13deg);
          box-shadow:
            rgba(5,71,17,.25) 30px 50px 25px -40px,
            rgba(5,71,17,.1) 0 25px 30px 0;
        }

        .parent:hover .dashboard-stat-bottom .dashboard-stat-arrow {
          transform: translate3d(0,0,10px);
          box-shadow: rgba(5,71,17,.25) -5px 14px 10px 0;
        }

        .parent:hover .dashboard-circle-2 {
          transform: translate3d(0,0,54px);
        }

        .parent:hover .dashboard-circle-3 {
          transform: translate3d(0,0,72px);
        }

        .parent:hover .dashboard-circle-4 {
          transform: translate3d(0,0,90px);
        }

        .parent:hover .dashboard-circle-5 {
          transform: translate3d(0,0,110px);
        }

        /* Alternate tones while retaining the same system */
        .parent-coral .dashboard-stat-card {
          background: linear-gradient(135deg, #ef775e, #fbac69);
        }

        .parent-coral .dashboard-stat-dot span {
          background: #c84d37;
        }

        .parent-coral .dashboard-stat-title,
        .parent-coral .dashboard-stat-value {
          color: #6b291d;
        }

        .parent-blue .dashboard-stat-card {
          background: linear-gradient(135deg, #2176c9, #69b9ee);
        }

        .parent-blue .dashboard-stat-dot span {
          background: #1b5b9a;
        }

        .parent-blue .dashboard-stat-title,
        .parent-blue .dashboard-stat-value {
          color: #123f6c;
        }

        .parent-violet .dashboard-stat-card {
          background: linear-gradient(135deg, #7655cf, #b08ce8);
        }

        .parent-violet .dashboard-stat-dot span {
          background: #55409c;
        }

        .parent-violet .dashboard-stat-title,
        .parent-violet .dashboard-stat-value {
          color: #3e2b74;
        }

        /* Uiverse-inspired expanding corner cards */
        .quick-action {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.7);
          padding: 25px;
          color: white;
          box-shadow: 0 18px 50px rgba(15,23,42,.08);
          transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .5s ease;
        }

        .quick-action::before,
        .quick-action::after {
          content: "";
          position: absolute;
          width: 21%;
          height: 21%;
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .quick-action::before {
          top: 0;
          right: 0;
          border-radius: 0 28px 0 100%;
          background: rgba(255,255,255,.12);
        }

        .quick-action::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 28px;
          background: rgba(255,255,255,.08);
        }

        .quick-action:hover {
          transform: translateY(-6px);
          box-shadow: 0 28px 70px rgba(15,23,42,.13);
        }

        .quick-action:hover::before,
        .quick-action:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 28px;
        }

        .quick-action-glow {
          position: absolute;
          top: -70px;
          right: -60px;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background: rgba(255,255,255,.11);
          filter: blur(20px);
          transition: transform .6s ease;
        }

        .quick-action:hover .quick-action-glow {
          transform: scale(1.35);
        }

        .quick-action-icon {
          position: relative;
          z-index: 3;
          display: flex;
          width: 50px;
          height: 50px;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.16);
          box-shadow: 0 12px 25px rgba(0,0,0,.08);
          backdrop-filter: blur(8px);
          transition: transform .45s cubic-bezier(.22,1,.36,1);
        }

        .quick-action:hover .quick-action-icon {
          transform: scale(1.06) rotate(-5deg);
        }

        .quick-action-copy {
          position: relative;
          z-index: 3;
          margin-top: 30px;
          max-width: 290px;
        }

        .quick-action-kicker {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .16em;
          opacity: .68;
        }

        .quick-action-copy h3 {
          margin-top: 7px;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.1;
        }

        .quick-action-copy p {
          margin-top: 8px;
          font-size: 11px;
          line-height: 1.7;
          color: rgba(255,255,255,.72);
        }

        .quick-action-arrow {
          position: absolute;
          right: 21px;
          bottom: 20px;
          z-index: 4;
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
          transition: transform .35s ease, background .35s ease;
        }

        .quick-action:hover .quick-action-arrow {
          transform: translateX(4px);
          background: rgba(255,255,255,.24);
        }

        .quick-action-shine {
          position: absolute;
          top: -30%;
          left: -35%;
          z-index: 2;
          width: 17%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.17), transparent);
          transition: left .8s ease;
          pointer-events: none;
        }

        .quick-action:hover .quick-action-shine {
          left: 135%;
        }

        .quick-action-green {
          background: linear-gradient(135deg, #0f6e5b, #0a9c7b);
        }

        .quick-action-coral {
          background: linear-gradient(135deg, #e55a42, #fa8e61);
        }

        .quick-action-blue {
          background: linear-gradient(135deg, #2467a8, #4da4df);
        }

        .quick-action-violet {
          background: linear-gradient(135deg, #7050c7, #9b72df);
        }

        /* Stacked glass panels */
        .dashboard-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.82);
          background: rgba(255,255,255,.67);
          box-shadow: 0 22px 65px rgba(15,23,42,.07);
          backdrop-filter: blur(22px);
        }

        .dashboard-panel::before,
        .dashboard-panel::after {
          content: "";
          position: absolute;
          width: 17%;
          height: 17%;
          pointer-events: none;
          background: rgba(15,110,91,.04);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .dashboard-panel::before {
          top: 0;
          right: 0;
          border-radius: 0 28px 0 100%;
        }

        .dashboard-panel::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 28px;
          background: rgba(15,110,91,.025);
        }

        .dashboard-panel:hover::before,
        .dashboard-panel:hover::after {
          width: 80%;
          height: 80%;
          border-radius: 28px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          padding: 10px 11px;
          transition: all .25s ease;
        }

        .activity-row:hover {
          background: rgba(15,110,91,.045);
          transform: translateX(2px);
        }

        .activity-icon {
          display: flex;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(15,110,91,.08);
          color: #0f6e5b;
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-stat-card,
          .dashboard-circle,
          .dashboard-stat-arrow,
          .quick-action,
          .quick-action::before,
          .quick-action::after,
          .quick-action-shine,
          .dashboard-panel::before,
          .dashboard-panel::after {
            transition: none !important;
          }

          .quick-action:hover,
          .parent:hover .dashboard-stat-card {
            transform: none;
          }
        }

        @media (max-width: 640px) {
          .dashboard-stat {
            min-height: 172px;
          }

          .dashboard-stat-card {
            height: 172px;
          }

          .dashboard-stat-content {
            padding: 58px 22px 0;
          }

          .dashboard-stat-value {
            font-size: 29px;
          }
        }
      `}</style>

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Greeting / top rail */}
        <section className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5">
                <HeartPulse size={13} className="text-primary" />
                Patient command center
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                <BadgeCheck size={11} />
                Care connected
              </span>
            </div>

            <p className="eyebrow mt-6">Your health, in one place</p>

            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
              Hi {firstName}.
              <span className="block text-primary">
                What do you need today?
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Book a consultation, track a medicine order, arrange home
              diagnostics, or keep your health records organized.
            </p>
          </div>

          <div className="dashboard-panel rounded-[1.6rem] px-4 py-3 sm:px-5">
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={17} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Account status
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  Your care journey is connected
                </p>
              </div>
            </div>
          </div>
        </section>

        <HealthPulseBanner />

        {/* Upcoming appointment */}
        {upcoming && (
          <Link
            to={`/patient/appointments/${upcoming._id}`}
            className="dashboard-panel group mt-6 block rounded-[2rem] p-5 sm:p-6"
          >
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/15 transition group-hover:scale-105 group-hover:rotate-[-3deg]">
                  <Clock3 size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-primary">
                      Upcoming consultation
                    </span>

                    <span className="text-[9px] font-medium text-slate-400">
                      {upcoming.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-slate-900">
                    Dr. {upcoming.doctor?.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(upcoming.scheduledStart).toLocaleString()}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition group-hover:-translate-y-0.5">
                View appointment
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        )}

        {/* Stats */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Health overview</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Your live activity
              </h2>
            </div>

            <span className="hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-slate-400 sm:flex">
              <Sparkles size={11} className="text-primary" />
              Updated from your account
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <ThreeDStat
              icon={Package}
              label="Active orders"
              value={loading ? "—" : activeOrders}
              to="/patient/orders"
              tone="primary"
            />
            <ThreeDStat
              icon={FlaskConical}
              label="Lab bookings"
              value={loading ? "—" : activeLabBookings}
              to="/patient/lab-bookings"
              tone="blue"
            />
            <ThreeDStat
              icon={Heart}
              label="Wishlist"
              value={loading ? "—" : wishlistCount}
              to="/patient/wishlist"
              tone="coral"
            />
            <ThreeDStat
              icon={FileText}
              label="Health vault"
              value={loading ? "—" : vaultCount}
              to="/patient/health-vault"
              tone="violet"
            />
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Quick access</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                What can we help with?
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((item) => (
              <QuickAction key={item.to} item={item} />
            ))}
          </div>
        </section>

        {/* Family + activity */}
        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div className="dashboard-panel rounded-[2rem] p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="eyebrow flex items-center gap-2">
                  <Users size={13} />
                  Family care
                </p>

                <Link
                  to="/patient/family"
                  className="text-[10px] font-bold text-primary transition hover:underline"
                >
                  Manage
                </Link>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {loading ? "—" : familyCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    managed family {familyCount === 1 ? "profile" : "profiles"}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                Book appointments and lab tests for family members you
                manage care for.
              </p>

              <Link
                to="/patient/family"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
              >
                Manage family
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="dashboard-panel rounded-[2rem] p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    Recent medicine orders
                  </h2>
                </div>

                <Link
                  to="/patient/orders"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-primary hover:text-white"
                  aria-label="View all medicine orders"
                >
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-5">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-14 animate-pulse rounded-xl bg-slate-100/80"
                      />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
                    <ShoppingBag
                      size={24}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No medicine orders yet.
                    </p>
                    <Link
                      to="/patient/store"
                      className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary"
                    >
                      Browse pharmacy
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {orders.slice(0, 3).map((order) => (
                      <ActivityRow key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Wellness cross-sell */}
        <section className="mt-7 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="dashboard-panel rounded-[2rem] p-6 sm:p-7">
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Sparkles size={13} />
                  Wellness
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Build healthier routines.
                </h2>

                <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500">
                  Use calorie tracking, diet planning, AI reviews, and other
                  wellness tools alongside your medical care.
                </p>
              </div>

              <Link
                to="/patient/wellness"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5"
              >
                Explore wellness
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] shadow-[0_20px_65px_rgba(15,23,42,.10)]">
            <img
              src={WELLNESS_IMAGE}
              alt="Healthy food and wellness"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

            <div className="relative z-10 flex min-h-[180px] flex-col justify-end p-6 text-white">
              <span className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                KapHealth wellness
              </span>
              <h3 className="mt-1 text-xl font-semibold">
                Care does not stop at the appointment.
              </h3>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
