import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Wallet, CalendarDays, Star, BadgeCheck, IndianRupee, Stethoscope } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = { pending_payment: "pending", confirmed: "success", in_progress: "processing", completed: "gray", cancelled: "danger", no_show: "danger" };

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);

  const upcoming = useMemo(
    () => appointments.find((appointment) => ["confirmed", "in_progress"].includes(appointment.status)),
    [appointments]
  );

  const counts = useMemo(
    () => ({
      total: appointments.length,
      confirmed: appointments.filter((appointment) => appointment.status === "confirmed").length,
      completed: appointments.filter((appointment) => appointment.status === "completed").length,
      pending: appointments.filter((appointment) => appointment.status === "pending_payment").length,
    }),
    [appointments]
  );

  useEffect(() => {
    api.get("/appointments").then(({ data }) => setAppointments(data.appointments || [])).catch(() => {});
    api.get("/doctors/me/profile").then(({ data }) => setProfile(data.profile)).catch(() => {});
    api.get("/doctors/me/earnings").then(({ data }) => setEarnings(data)).catch(() => {});
  }, []);

  const firstName = profile?.user?.name?.split(" ")[0] || "doctor";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="gradient-hero relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-white/70">Doctor dashboard</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Welcome back, Dr. {firstName}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/85">
                {profile?.specializations?.[0] && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Stethoscope size={14} /> {profile.specializations.join(", ")}</span>
                )}
                {profile?.ratingCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><Star size={14} className="fill-amber-300 text-amber-300" /> {profile.ratingAverage?.toFixed(1)} ({profile.ratingCount})</span>
                )}
                {profile?.consultationFee && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><IndianRupee size={14} /> {profile.consultationFee} / consult</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/doctor/earnings" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-dark shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <Wallet size={16} /> View earnings
              </Link>
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStat label="Total appointments" value={counts.total} />
            <HeroStat label="Confirmed" value={counts.confirmed} />
            <HeroStat label="Completed" value={counts.completed} />
            <HeroStat label="This month's earnings" value={earnings ? `₹${earnings.thisMonth.earned}` : "—"} />
          </div>
        </div>

        {profile && profile.onboardingStatus !== "approved" && (
          <div className="mt-6 rounded-[2rem] border border-status-pending/30 bg-status-pending/10 p-6 text-ink shadow-sm backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <BadgeCheck size={24} className="text-status-pending" />
              <div>
                <p className="font-semibold">Onboarding status: {profile.onboardingStatus.replace(/_/g, " ")}</p>
                <p className="mt-2 text-sm text-muted">
                  Your profile will be visible to patients once approval completes. {profile.adminReviewNote && <span>Note: {profile.adminReviewNote}</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card-hover glass-panel p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-slate-500">Next appointment</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{upcoming ? upcoming.patient.name : "No confirmed appointments"}</h2>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {upcoming ? upcoming.status.replace(/_/g, " ") : "Ready for bookings"}
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-muted">
              {upcoming ? (
                <>
                  <p>When: {new Date(upcoming.scheduledStart).toLocaleString()}</p>
                  <p>Patient: {upcoming.patient.name}</p>
                  <p>Reason: {upcoming.reasonForVisit || "Consultation"}</p>
                </>
              ) : (
                <p>As soon as a patient books a slot, it will appear here for fast join and review.</p>
              )}
            </div>
            {upcoming && (
              <Link
                to={`/doctor/consult/${upcoming._id}`}
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                <Video size={16} /> Join consult
              </Link>
            )}
          </div>

          <div className="card-hover glass-panel p-8">
            <p className="eyebrow text-slate-500">Quick actions</p>
            <div className="mt-6 space-y-4">
              <Link to="/doctor/earnings" className="block rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-ink transition hover:border-primary/30 hover:bg-primary-light">
                <span className="flex items-center gap-3"><Wallet size={18} /> View earnings & payouts</span>
              </Link>
              <Link to="/doctor/onboarding" className="block rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-ink transition hover:border-primary/30 hover:bg-primary-light">
                <span className="flex items-center gap-3"><CalendarDays size={18} /> Review onboarding details</span>
              </Link>
              {profile?.user?._id && (
                <Link to={`/patient/doctors/${profile.user._id}`} className="block rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-ink transition hover:border-primary/30 hover:bg-primary-light">
                  <span className="flex items-center gap-3"><Stethoscope size={18} /> See your public profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 glass-panel p-8">
          <p className="eyebrow text-slate-500">Appointments</p>
          <div className="mt-6 space-y-4">
            {appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-muted">
                No appointments yet. Your schedule will show booked consultations here.
              </div>
            ) : (
              appointments.map((a) => (
                <div key={a._id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{a.patient.name}</p>
                    <p className="text-sm text-muted">{new Date(a.scheduledStart).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone={TONE[a.status]}>{a.status.replace(/_/g, " ")}</StatusBadge>
                    {["confirmed", "in_progress"].includes(a.status) && (
                      <Link to={`/doctor/consult/${a._id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                        <Video size={14} /> Join
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
