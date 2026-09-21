import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Video,
  Wallet,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = {
  pending_payment: "pending",
  confirmed: "success",
  in_progress: "processing",
  completed: "gray",
  cancelled: "danger",
  no_show: "danger",
};

const DOCTOR_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=85";

const CLINICAL_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85";

function GlassHeroStack({ profile, firstName, counts, monthEarnings, approved }) {
  return (
    <section className="doctor-glass-stage">
      <div className="doctor-glass doctor-glass-1" data-text="CLINICAL" />
      <div className="doctor-glass doctor-glass-2" data-text="TELEHEALTH" />

      <div className="doctor-glass doctor-glass-main">
        <div className="doctor-glass-content">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="doctor-pill">
                  <Stethoscope size={12} />
                  Doctor workspace
                </span>

                <span
                  className={`doctor-pill ${
                    approved ? "doctor-pill-success" : "doctor-pill-pending"
                  }`}
                >
                  <span className="doctor-live-dot" />
                  {approved
                    ? "Profile approved"
                    : profile?.onboardingStatus?.replace(/_/g, " ") ||
                      "Profile review"}
                </span>
              </div>

              <p className="eyebrow mt-8">
                KapHealth clinical command center
              </p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.03] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Welcome back,
                <span className="block text-primary">
                  Dr. {firstName}.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Your consultations, patient queue, earnings and secure video
                rooms, organized into one focused workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {profile?.specializations?.[0] && (
                  <span className="doctor-soft-pill">
                    <Stethoscope size={11} />
                    {profile.specializations.join(", ")}
                  </span>
                )}

                {profile?.ratingCount > 0 && (
                  <span className="doctor-soft-pill">
                    <Star size={11} className="fill-amber-300 text-amber-400" />
                    {Number(profile.ratingAverage || 0).toFixed(1)} ·{" "}
                    {profile.ratingCount} reviews
                  </span>
                )}

                {profile?.consultationFee && (
                  <span className="doctor-soft-pill">
                    <IndianRupee size={11} />
                    {profile.consultationFee} / consult
                  </span>
                )}
              </div>
            </div>

            <div className="doctor-profile-glass hidden lg:block">
              <img
                src={profile?.user?.avatarUrl || DOCTOR_IMAGE}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/45">
                  Professional profile
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Dr. {profile?.user?.name || "Doctor"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStat
              icon={CalendarDays}
              label="Appointments"
              value={counts.total}
            />
            <HeroStat
              icon={CheckCircle2}
              label="Confirmed"
              value={counts.confirmed}
            />
            <HeroStat
              icon={BadgeCheck}
              label="Completed"
              value={counts.completed}
            />
            <HeroStat
              icon={Wallet}
              label="This month"
              value={
                monthEarnings !== null && monthEarnings !== undefined
                  ? `₹${monthEarnings}`
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="hero-stat">
      <span className="hero-stat-icon">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/45">
          {label}
        </p>
        <p className="mt-1 truncate font-mono text-2xl font-bold text-white sm:text-3xl">
          {value}
        </p>
      </div>
    </div>
  );
}

function CornerHoverCard({ children, className = "" }) {
  return (
    <div className={`corner-hover-card ${className}`}>
      <span className="corner-top" />
      <span className="corner-bottom" />
      {children}
    </div>
  );
}

function QuickActionFlip({ to, title, description, front, icon: Icon }) {
  return (
    <Link to={to} className="flip-card-mini group">
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front-mini">
          <div className="flip-icon">
            <Icon size={19} />
          </div>
          <p className="flip-kicker">{front}</p>
          <h3>{title}</h3>
          <span className="flip-hint">
            Hover to explore <ArrowRight size={12} />
          </span>
        </div>

        <div className="flip-card-face flip-card-back-mini">
          <div>
            <p className="flip-kicker text-white/45">Workspace action</p>
            <h3>{title}</h3>
            <p className="mt-2 text-xs leading-5 text-white/65">
              {description}
            </p>
          </div>

          <span className="flip-open">
            Open
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function AppointmentRow({ appointment }) {
  return (
    <div className="appointment-card group">
      <div className="appointment-main">
        <div className="appointment-avatar">
          {appointment.patient?.name?.charAt(0) || "P"}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {appointment.patient?.name || "Patient"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={10} />
              {new Date(
                appointment.scheduledStart
              ).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} />
              {new Date(
                appointment.scheduledStart
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={TONE[appointment.status]}>
          {appointment.status?.replace(/_/g, " ")}
        </StatusBadge>

        {["confirmed", "in_progress"].includes(appointment.status) && (
          <Link
            to={`/doctor/consult/${appointment._id}`}
            className="appointment-join"
          >
            <Video size={12} />
            Join
          </Link>
        )}
      </div>
    </div>
  );
}

function Snapshot({ label, value, sub }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200/75 bg-white/60 p-4 transition hover:bg-white hover:shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-[.13em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-[9px] leading-4 text-slate-400">{sub}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  const upcoming = useMemo(
    () =>
      appointments.find((appointment) =>
        ["confirmed", "in_progress"].includes(appointment.status)
      ),
    [appointments]
  );

  const counts = useMemo(
    () => ({
      total: appointments.length,
      confirmed: appointments.filter(
        (appointment) => appointment.status === "confirmed"
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "completed"
      ).length,
      pending: appointments.filter(
        (appointment) => appointment.status === "pending_payment"
      ).length,
    }),
    [appointments]
  );

  const monthEarnings =
    earnings?.thisMonth?.earned ??
    earnings?.thisMonth?.total ??
    earnings?.earnedThisMonth ??
    null;

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get("/appointments"),
        api.get("/doctors/me/profile"),
        api.get("/doctors/me/earnings"),
      ]);

      if (!mounted) return;

      const [appointmentResult, profileResult, earningsResult] = results;

      if (appointmentResult.status === "fulfilled") {
        setAppointments(
          appointmentResult.value.data.appointments || []
        );
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data.profile || null);
      }

      if (earningsResult.status === "fulfilled") {
        setEarnings(earningsResult.value.data || null);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const firstName =
    profile?.user?.name?.split(" ")[0] || "Doctor";

  const approved =
    profile?.onboardingStatus === "approved";

  return (
    <div className="doctor-page relative min-h-screen overflow-hidden bg-[#f3f8f5] pb-10">
      <Navbar />

      <style>{`
        .doctor-page {
          background:
            radial-gradient(circle at 5% 7%, rgba(15,110,91,.08), transparent 32rem),
            radial-gradient(circle at 96% 22%, rgba(16,185,129,.055), transparent 28rem),
            #f3f8f5;
        }

        .doctor-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .30;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        /* ===== GLASS STACK REFERENCE ===== */
        .doctor-glass-stage {
          position: relative;
          min-height: 565px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .doctor-glass {
          position: absolute;
          width: 92%;
          height: 470px;
          border: 1px solid rgba(255,255,255,.42);
          border-radius: 34px;
          box-shadow:
            0 26px 65px rgba(15,23,42,.10),
            inset 0 1px rgba(255,255,255,.45);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: .55s cubic-bezier(.22,1,.36,1);
          overflow: hidden;
        }

        .doctor-glass::before {
          content: attr(data-text);
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.25);
          background: rgba(255,255,255,.05);
          border-radius: 0 0 34px 34px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .28em;
        }

        .doctor-glass-1 {
          width: 86%;
          transform: rotate(-6deg) translateX(-35px);
          background: linear-gradient(135deg, rgba(15,110,91,.28), rgba(15,110,91,.06));
        }

        .doctor-glass-2 {
          width: 89%;
          transform: rotate(6deg) translateX(35px);
          background: linear-gradient(135deg, rgba(16,185,129,.25), rgba(255,255,255,.08));
        }

        .doctor-glass-main {
          z-index: 3;
          width: 100%;
          height: 515px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.42)),
            rgba(255,255,255,.55);
          border-color: rgba(255,255,255,.88);
        }

        .doctor-glass-content {
          position: relative;
          height: 100%;
          overflow: hidden;
          padding: 30px;
          border-radius: inherit;
        }

        .doctor-glass-stage:hover .doctor-glass-1 {
          transform: rotate(-8deg) translateX(-48px);
        }

        .doctor-glass-stage:hover .doctor-glass-2 {
          transform: rotate(8deg) translateX(48px);
        }

        .doctor-glass-stage:hover .doctor-glass-main {
          transform: translateY(-5px);
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(5px);
        }

        .hero-orb-one {
          width: 250px;
          height: 250px;
          right: -70px;
          top: -85px;
          background: rgba(15,110,91,.12);
        }

        .hero-orb-two {
          width: 210px;
          height: 210px;
          left: 28%;
          bottom: -105px;
          background: rgba(255,107,74,.06);
        }

        .doctor-profile-glass {
          position: relative;
          width: 245px;
          height: 205px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 20px 45px rgba(15,23,42,.12);
          background: rgba(255,255,255,.35);
          backdrop-filter: blur(14px);
        }

        .doctor-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.8);
          background: rgba(255,255,255,.60);
          padding: 7px 12px;
          font-size: 9px;
          font-weight: 700;
          color: #475569;
          box-shadow: 0 4px 14px rgba(15,23,42,.04);
          backdrop-filter: blur(10px);
        }

        .doctor-pill-success {
          background: rgba(236,253,245,.85);
          color: #047857;
          border-color: rgba(167,243,208,.8);
        }

        .doctor-pill-pending {
          background: rgba(255,247,237,.88);
          color: #b45309;
          border-color: rgba(253,186,116,.55);
        }

        .doctor-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: currentColor;
        }

        .doctor-soft-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(15,23,42,.06);
          background: rgba(255,255,255,.62);
          padding: 7px 11px;
          color: #64748b;
          font-size: 9px;
          backdrop-filter: blur(8px);
        }

        .hero-stat {
          position: relative;
          display: flex;
          min-height: 92px;
          align-items: flex-start;
          gap: 11px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 22px;
          background: rgba(2,44,34,.72);
          padding: 15px;
          box-shadow: 0 12px 26px rgba(15,23,42,.10);
          backdrop-filter: blur(12px);
        }

        .hero-stat-icon {
          display: flex;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.76);
        }

        /* ===== EXPANDING CORNER REFERENCE ===== */
        .corner-hover-card {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
        }

        .corner-hover-card .corner-top,
        .corner-hover-card .corner-bottom {
          position: absolute;
          z-index: 0;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.04);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .corner-hover-card .corner-top {
          top: 0;
          right: 0;
          border-radius: 0 30px 0 100%;
        }

        .corner-hover-card .corner-bottom {
          left: 0;
          bottom: 0;
          border-radius: 0 100% 0 30px;
          background: rgba(15,110,91,.025);
        }

        .corner-hover-card:hover .corner-top,
        .corner-hover-card:hover .corner-bottom {
          width: 100%;
          height: 100%;
          border-radius: 30px;
        }

        /* ===== FLIP CARD REFERENCE ===== */
        .flip-card-mini {
          width: 100%;
          height: 205px;
          perspective: 1000px;
          display: block;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform .8s;
          transform-style: preserve-3d;
        }

        .flip-card-mini:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 28px;
          padding: 22px;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          overflow: hidden;
        }

        .flip-card-front-mini {
          color: #0f172a;
          border: 1px solid rgba(255,255,255,.82);
          background:
            linear-gradient(135deg, rgba(255,255,255,.84), rgba(255,255,255,.50));
          box-shadow: 0 18px 55px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
        }

        .flip-card-front-mini::before,
        .flip-card-front-mini::after,
        .flip-card-back-mini::before,
        .flip-card-back-mini::after {
          content: "";
          position: absolute;
          width: 22%;
          height: 22%;
          background: rgba(15,110,91,.045);
          transition: .5s cubic-bezier(.22,1,.36,1);
          pointer-events: none;
        }

        .flip-card-front-mini::before,
        .flip-card-back-mini::before {
          right: 0;
          top: 0;
          border-radius: 0 28px 0 100%;
        }

        .flip-card-front-mini::after,
        .flip-card-back-mini::after {
          left: 0;
          bottom: 0;
          border-radius: 0 100% 0 28px;
        }

        .flip-card-mini:hover .flip-card-front-mini::before,
        .flip-card-mini:hover .flip-card-front-mini::after,
        .flip-card-mini:hover .flip-card-back-mini::before,
        .flip-card-mini:hover .flip-card-back-mini::after {
          width: 100%;
          height: 100%;
          border-radius: 28px;
        }

        .flip-card-back-mini {
          transform: rotateY(180deg);
          color: white;
          background: linear-gradient(135deg, #0f6e5b, #087c66);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 24px 65px rgba(15,110,91,.18);
        }

        .flip-icon {
          position: relative;
          z-index: 1;
          display: flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: rgba(15,110,91,.10);
          color: #0f6e5b;
          transition: transform .35s ease;
        }

        .flip-card-mini:hover .flip-icon {
          transform: scale(1.06) rotate(-4deg);
        }

        .flip-kicker {
          position: relative;
          z-index: 1;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .15em;
          color: #94a3b8;
        }

        .flip-card-front-mini h3,
        .flip-card-back-mini h3 {
          position: relative;
          z-index: 1;
          margin-top: 5px;
          font-size: 18px;
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -.02em;
        }

        .flip-hint {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
          color: #0f6e5b;
          font-size: 9px;
          font-weight: 700;
        }

        .flip-open {
          position: relative;
          z-index: 1;
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          padding: 8px 11px;
          font-size: 9px;
          font-weight: 700;
        }

        /* Appointment / panels */
        .doctor-panel {
          position: relative;
          overflow: hidden;
        }

        .doctor-panel::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 14%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.19), transparent);
          transition: left .8s ease;
          pointer-events: none;
        }

        .doctor-panel:hover::after {
          left: 130%;
        }

        .appointment-card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          min-height: 68px;
          overflow: hidden;
          border-radius: 19px;
          border: 1px solid transparent;
          background: rgba(255,255,255,.45);
          padding: 11px 12px;
          transition: .3s ease;
        }

        .appointment-card::before,
        .appointment-card::after {
          position: absolute;
          content: "";
          width: 18%;
          height: 18%;
          background: rgba(15,110,91,.035);
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .appointment-card::before {
          right: 0;
          top: 0;
          border-radius: 0 19px 0 100%;
        }

        .appointment-card::after {
          left: 0;
          bottom: 0;
          border-radius: 0 100% 0 19px;
        }

        .appointment-card:hover {
          transform: translateX(2px);
          border-color: rgba(15,110,91,.10);
          background: rgba(255,255,255,.78);
          box-shadow: 0 10px 30px rgba(15,23,42,.05);
        }

        .appointment-card:hover::before,
        .appointment-card:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 19px;
        }

        .appointment-main {
          position: relative;
          z-index: 1;
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 12px;
        }

        .appointment-avatar {
          display: flex;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(15,110,91,.12), rgba(15,110,91,.03));
          color: #0f6e5b;
          font-size: 12px;
          font-weight: 800;
        }

        .appointment-join {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 999px;
          background: #0f6e5b;
          padding: 8px 11px;
          color: white;
          font-size: 9px;
          font-weight: 700;
          transition: .25s ease;
        }

        .appointment-join:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15,110,91,.18);
        }

        .doctor-promo {
          position: relative;
          overflow: hidden;
          min-height: 320px;
          border-radius: 32px;
          box-shadow: 0 28px 80px rgba(15,23,42,.12);
        }

        .doctor-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
          animation: doctor-promo-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes doctor-promo-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (max-width: 900px) {
          .doctor-glass-stage {
            min-height: 620px;
          }

          .doctor-glass {
            height: 515px;
          }

          .doctor-glass-main {
            height: 560px;
          }
        }

        @media (max-width: 640px) {
          .doctor-glass-stage {
            display: block;
            min-height: auto;
          }

          .doctor-glass-1,
          .doctor-glass-2 {
            display: none;
          }

          .doctor-glass-main {
            position: relative;
            width: 100%;
            height: auto;
          }

          .doctor-glass-content {
            min-height: 650px;
            padding: 22px;
          }

          .flip-card-mini {
            height: 190px;
          }

          .appointment-card {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .doctor-glass,
          .corner-hover-card .corner-top,
          .corner-hover-card .corner-bottom,
          .flip-card-inner,
          .appointment-card,
          .appointment-card::before,
          .appointment-card::after,
          .doctor-panel::after,
          .doctor-promo::after,
          .doctor-glass-stage:hover .doctor-glass-1,
          .doctor-glass-stage:hover .doctor-glass-2,
          .doctor-glass-stage:hover .doctor-glass-main {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-9">
        <GlassHeroStack
          profile={profile}
          firstName={firstName}
          counts={counts}
          monthEarnings={monthEarnings}
          approved={approved}
        />

        {profile && !approved && (
          <section className="mt-5 rounded-[2rem] border border-amber-200 bg-amber-50/90 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <BadgeCheck size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-950">
                  Onboarding status:{" "}
                  {profile.onboardingStatus?.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800/75">
                  Your public profile becomes visible to patients after
                  approval.
                  {profile.adminReviewNote
                    ? ` ${profile.adminReviewNote}`
                    : ""}
                </p>
              </div>

              <Link
                to="/doctor/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-700 px-4 py-2.5 text-[9px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-amber-800"
              >
                Review details
                <ArrowRight size={12} />
              </Link>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
          {/* Next appointment */}
          <CornerHoverCard className="doctor-panel border border-white/80 bg-white/68 p-6 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
            <div className="relative z-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Next appointment</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    {upcoming
                      ? upcoming.patient?.name || "Patient"
                      : "Your schedule is open"}
                  </h2>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Video size={17} />
                </span>
              </div>

              <div className="mt-5 rounded-[1.65rem] border border-slate-200/75 bg-white/58 p-5">
                {upcoming ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {upcoming.status.replace(/_/g, " ")}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-semibold text-slate-500">
                        <CalendarDays size={10} />
                        {new Date(
                          upcoming.scheduledStart
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Snapshot
                        label="When"
                        value={new Date(
                          upcoming.scheduledStart
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        sub={new Date(
                          upcoming.scheduledStart
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                        })}
                      />

                      <Snapshot
                        label="Reason"
                        value={
                          upcoming.reasonForVisit || "Consultation"
                        }
                        sub="Patient's stated booking reason"
                      />
                    </div>

                    <Link
                      to={`/doctor/consult/${upcoming._id}`}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-[.11em] text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      <Video size={13} />
                      Join consultation
                      <ArrowRight size={12} />
                    </Link>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CalendarDays size={23} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-800">
                      No confirmed appointment is waiting.
                    </p>
                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                      New consultations will appear here as soon as patients
                      book a slot.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CornerHoverCard>

          {/* Flip quick actions */}
          <section>
            <div className="mb-4">
              <p className="eyebrow">Workspace shortcuts</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Your most-used actions
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <QuickActionFlip
                to="/doctor/earnings"
                title="Earnings & payouts"
                front="Finance"
                icon={Wallet}
                description="Review consultation revenue, payout activity and monthly performance."
              />

              <QuickActionFlip
                to="/doctor/onboarding"
                title="Profile & availability"
                front="Profile"
                icon={CalendarDays}
                description="Keep your professional information and onboarding details current."
              />

              {profile?.user?._id && (
                <QuickActionFlip
                  to={`/patient/doctors/${profile.user._id}`}
                  title="Public profile"
                  front="Patient view"
                  icon={Stethoscope}
                  description="Preview the doctor profile that patients use to choose and book you."
                />
              )}

              <QuickActionFlip
                to="/doctor/earnings"
                title="Practice snapshot"
                front="Analytics"
                icon={TrendingUp}
                description="Use your current appointment and earnings signals to understand your workload."
              />
            </div>
          </section>
        </div>

        {/* Appointment feed */}
        <CornerHoverCard className="doctor-panel mt-6 border border-white/80 bg-white/68 p-6 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
          <div className="relative z-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Schedule</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Appointments
                </h2>
              </div>

              <span className="rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold text-primary">
                {loading ? "Loading" : `${appointments.length} total`}
              </span>
            </div>

            <div className="mt-5 rounded-[1.7rem] border border-slate-200/70 bg-white/42 p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-[68px] animate-pulse rounded-[1.2rem] bg-slate-200/60"
                    />
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white/50 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarDays size={22} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    No appointments yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Booked consultations will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {appointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CornerHoverCard>

        {/* Clinical promo */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="doctor-promo group">
            <img
              src={CLINICAL_IMAGE}
              alt="Healthcare consultation"
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/15" />

            <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-7 text-white sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                  KapHealth Care Network
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Sparkles size={15} />
                </span>
              </div>

              <div className="max-w-xl">
                <p className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  One clinical flow
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Consult.
                  <span className="block text-emerald-200">
                    Document. Prescribe.
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/48">
                  Keep appointments, secure video, patient messaging and
                  e-prescriptions inside the same clinical workflow.
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/80 bg-white/68 p-6 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrendingUp size={18} />
              </div>

              <div>
                <p className="eyebrow">Operating view</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Keep the queue moving.
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Snapshot
                label="Confirmed"
                value={counts.confirmed}
                sub="Consultations ready to join"
              />
              <Snapshot
                label="Pending payment"
                value={counts.pending}
                sub="Appointments awaiting payment"
              />
              <Snapshot
                label="Completed"
                value={counts.completed}
                sub="Finished consultations"
              />
              <Snapshot
                label="Total"
                value={counts.total}
                sub="Appointments on your account"
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.11em] text-slate-400">
              <LockKeyhole size={10} className="text-primary" />
              Secure doctor workspace
              <CheckCircle2 size={11} className="ml-auto text-primary/60" />
            </div>
          </section>
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · doctor workspace
          <ChevronRight size={11} />
          <ShieldCheck size={11} className="text-primary/45" />
        </div>
      </main>
    </div>
  );
}
