import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const STATUS_TONE = {
  pending_payment: "pending",
  confirmed: "success",
  in_progress: "processing",
  completed: "gray",
  cancelled: "danger",
  no_show: "danger",
};

function formatDate(date) {
  const value = new Date(date);

  return value.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status = "") {
  return status.replaceAll("_", " ");
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAppointment() {
      try {
        const { data } = await api.get(`/appointments/${id}`);

        if (!mounted) return;

        setAppointment(data.appointment);
      } catch (err) {
        if (!mounted) return;

        setLoadError(
          err.response?.data?.message ||
            "We couldn't load this appointment."
        );
      }
    }

    loadAppointment();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    if (!appointment || reviewSubmitting) return;

    setReviewSubmitting(true);

    try {
      await api.post("/reviews", {
        targetType: "doctor",
        targetId: appointment.doctor._id,
        rating,
        comment,
      });

      setReviewed(true);
    } finally {
      setReviewSubmitting(false);
    }
  }

  const canJoin = useMemo(
    () => ["confirmed", "in_progress"].includes(appointment?.status),
    [appointment?.status]
  );

  if (!appointment) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />

        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays
                size={24}
                className={loadError ? "" : "animate-pulse"}
              />
            </div>

            <p className="eyebrow mt-5">
              {loadError ? "Appointment unavailable" : "Secure workspace"}
            </p>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {loadError ? "Unable to load appointment" : "Loading appointment"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              {loadError ||
                "We're securely retrieving your consultation details."}
            </p>

            {loadError && (
              <Link to="/patient/appointments" className="btn-secondary mt-6">
                <ArrowLeft size={15} />
                Back to appointments
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 top-16 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-48 bottom-0 h-[32rem] w-[32rem] rounded-full bg-accent/[0.05] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <main className="relative mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header / breadcrumb */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            to="/patient/appointments"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={15} />
            </span>
            My appointments
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
            <ShieldCheck size={12} className="text-primary" />
            Secure appointment record
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          {/* Top identity panel */}
          <div className="relative overflow-hidden border-b border-slate-200/70 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/[0.07] blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F6E5B] to-[#0A4F42] text-white shadow-lg shadow-primary/15">
                  <Stethoscope size={24} strokeWidth={1.7} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                      Dr. {appointment.doctor.name}
                    </h1>

                    <StatusBadge tone={STATUS_TONE[appointment.status]}>
                      {statusLabel(appointment.status)}
                    </StatusBadge>
                  </div>

                  <p className="mt-1.5 text-sm text-slate-500">
                    Your KapHealth consultation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white/65 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Date
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-800">
                    {new Date(appointment.scheduledStart).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/65 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Time
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-800">
                    {formatTime(appointment.scheduledStart)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment details */}
          <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 md:col-span-2">
              <p className="eyebrow">Appointment details</p>

              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                {formatDate(appointment.scheduledStart)}
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Scheduled time
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatTime(appointment.scheduledStart)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <LockKeyhole size={14} className="text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Consultation
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Secure video consultation
                  </p>
                </div>
              </div>

              {/* Primary actions */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {canJoin && (
                  <Link
                    to={`/patient/consult/${appointment._id}`}
                    className="group flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_rgba(255,255,255,.7),0_7px_16px_rgba(148,163,184,.28),0_-3px_4px_rgba(206,207,209,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_5px_4px_rgba(255,255,255,.75),0_10px_22px_rgba(148,163,184,.34),0_-4px_5px_rgba(206,207,209,.45)]"
                  >
                    <Video size={16} className="text-primary" />
                    Join video consult
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                )}

                {appointment.prescription && (
                  <Link
                    to={`/patient/prescriptions/${appointment.prescription._id}`}
                    className="group flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/[0.05] px-5 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/[0.09] hover:shadow-md"
                  >
                    <FileText size={16} />
                    View e-prescription
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                )}

                {!canJoin && !appointment.prescription && (
                  <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500">
                    <MessageCircle size={16} className="shrink-0 text-primary" />
                    Your appointment is not currently open for consultation.
                  </div>
                )}
              </div>
            </div>

            {/* Status card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F6E5B] to-[#083F37] p-5 text-white shadow-lg">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.06] blur-2xl" />

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  {appointment.status === "completed" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </div>

                <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/60">
                  Appointment status
                </p>

                <p className="mt-1 text-xl font-semibold capitalize">
                  {statusLabel(appointment.status)}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Your appointment information and healthcare documents stay
                  connected to this secure record.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Review */}
        {appointment.status === "completed" && !reviewed && (
          <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <form onSubmit={submitReview} className="p-6 sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">Your feedback matters</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                    How was your consultation?
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
                    Rate your experience with Dr. {appointment.doctor.name}
                    and optionally leave a note.
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2.5">
                  {[1, 2, 3, 4, 5].map((number) => {
                    const activeStar = number <= (hoverRating || rating);

                    return (
                      <button
                        key={number}
                        type="button"
                        onMouseEnter={() => setHoverRating(number)}
                        onMouseLeave={() => setHoverRating(0)}
                        onFocus={() => setHoverRating(number)}
                        onBlur={() => setHoverRating(0)}
                        onClick={() => setRating(number)}
                        className="rounded-lg p-1 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        aria-label={`Rate ${number} out of 5`}
                      >
                        <Star
                          size={23}
                          strokeWidth={1.7}
                          className={
                            activeStar
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <label className="label" htmlFor="appointment-review">
                  Optional feedback
                </label>

                <textarea
                  id="appointment-review"
                  className="input min-h-[110px] resize-y"
                  rows={3}
                  placeholder="Tell us about your consultation experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-primary min-w-[150px]"
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit review
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {reviewed && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/75 px-4 py-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={17} />
            Thanks for helping improve the KapHealth experience.
          </div>
        )}
      </main>
    </div>
  );
}
