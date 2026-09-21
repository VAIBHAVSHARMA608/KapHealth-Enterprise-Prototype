import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  FileText,
  MapPin,
  PackageCheck,
  Play,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = {
  booked: "pending",
  sample_collected: "processing",
  processing: "processing",
  report_ready: "success",
  cancelled: "danger",
};

const LABEL = {
  booked: "Booked",
  sample_collected: "Sample collected",
  processing: "Processing",
  report_ready: "Report ready",
  cancelled: "Cancelled",
};

const LAB_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1400&q=85";

const LAB_VIDEO_PAGE =
  "https://www.pexels.com/search/videos/laboratory/";

function BookingCard({ booking, index }) {
  const isReady = booking.status === "report_ready";
  const isCancelled = booking.status === "cancelled";
  const testCount = booking.tests?.length || 0;

  return (
    <Link
      to={`/patient/lab-bookings/${booking._id}`}
      className="lab-booking group relative block overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,110,91,.11)] sm:p-6"
    >
      <span className="lab-corner lab-corner-top" />
      <span className="lab-corner lab-corner-bottom" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-white shadow-lg shadow-primary/15 transition duration-500 group-hover:scale-105 group-hover:rotate-[-3deg]">
          <FlaskConical size={21} strokeWidth={1.7} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {booking.bookingNumber}
            </p>

            <span className="rounded-full bg-primary/[0.05] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-primary">
              {testCount} {testCount === 1 ? "test" : "tests"}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {booking.tests.map((test) => test.name).join(", ")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} className="text-primary/70" />
              {new Date(booking.scheduledDate).toLocaleDateString()}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 size={12} className="text-primary/70" />
              {booking.timeSlot}
            </span>

            {booking.bookingFor?.type === "dependent" &&
              booking.bookingFor.dependentName && (
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <MapPin size={12} />
                  {booking.bookingFor.dependentName}
                </span>
              )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <StatusBadge tone={TONE[booking.status]}>
            {LABEL[booking.status] || booking.status}
          </StatusBadge>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          {isReady ? (
            <>
              <FileText size={12} className="text-emerald-600" />
              Report ready to view
            </>
          ) : isCancelled ? (
            <>
              <ShieldCheck size={12} />
              Booking closed
            </>
          ) : (
            <>
              <PackageCheck size={12} className="text-primary" />
              Tracking active
            </>
          )}
        </span>

        <span className="text-[9px] font-semibold uppercase tracking-[.12em] text-slate-300 transition group-hover:text-primary">
          View details
        </span>
      </div>

      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      <span className="absolute right-4 top-4 text-[9px] font-bold text-slate-200">
        {String(index + 1).padStart(2, "0")}
      </span>
    </Link>
  );
}

function PromoBanner() {
  return (
    <section className="promo-banner group relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_26px_80px_rgba(15,23,42,.14)]">
      <div className="absolute inset-0">
        <img
          src={LAB_PROMO_IMAGE}
          alt="Laboratory diagnostics environment"
          className="h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/25" />
      </div>

      <div className="relative z-10 flex min-h-[245px] items-center p-7 sm:p-9">
        <div className="max-w-2xl text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
              KapHealth Diagnostics
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/55">
              Connected care
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tests should be easy to follow.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
            From booking to sample collection to your digital report, keep
            every diagnostic milestone visible in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/patient/lab-tests"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Book another test
              <ArrowRight size={14} />
            </Link>

            <a
              href={LAB_VIDEO_PAGE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <Play size={13} fill="currentColor" />
              Explore diagnostics
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 hidden rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-md lg:block">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <TestTube2 size={16} />
          </div>
          <div>
            <p className="text-[10px] font-semibold">Digital diagnostics</p>
            <p className="mt-0.5 text-[9px] text-white/45">
              Track every milestone
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LabBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBookings() {
      setLoading(true);

      try {
        const { data } = await api.get("/lab-tests/bookings/mine");

        if (!mounted) return;

        setBookings(data.bookings || []);
        setError("");
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load your lab bookings."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      mounted = false;
    };
  }, []);

  const reportReadyCount = bookings.filter(
    (booking) => booking.status === "report_ready"
  ).length;

  const activeCount = bookings.filter(
    (booking) =>
      ["booked", "sample_collected", "processing"].includes(booking.status)
  ).length;

  return (
    <div className="lab-list-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .lab-list-page {
          background:
            radial-gradient(circle at 8% 7%, rgba(15,110,91,.08), transparent 29rem),
            radial-gradient(circle at 92% 29%, rgba(16,185,129,.055), transparent 27rem),
            #f4f9f6;
        }

        .lab-list-page::before {
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

        .lab-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .lab-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.75rem 0 100%;
        }

        .lab-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.75rem;
          background: rgba(15,110,91,.03);
        }

        .lab-booking:hover .lab-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.75rem;
        }

        .promo-banner::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -25%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.18),
            transparent
          );
          animation: lab-banner-shine 6s ease-in-out infinite;
        }

        @keyframes lab-banner-shine {
          0%, 45% { left: -25%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lab-corner,
          .promo-banner::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_20px_70px_rgba(15,23,42,.065)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary" />
                  Secure diagnostics
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700">
                  <CheckCircle2 size={11} />
                  Trackable
                </span>
              </div>

              <p className="eyebrow mt-6">Diagnostics</p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                Your lab bookings,
                <span className="block text-primary">
                  all in one place.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Check upcoming collections, review test details, and open
                digital reports from one clean diagnostic timeline.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to="/patient/lab-tests"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  <FlaskConical size={14} />
                  Book a test
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/75 px-4 py-3 text-[10px] font-semibold text-slate-500 shadow-sm">
                  <span>{activeCount}</span>
                  active
                  <span className="mx-1 text-slate-300">·</span>
                  <span>{reportReadyCount}</span>
                  reports ready
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-[250px]">
              <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4">
                <TestTube2 size={17} className="text-primary" />
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Total
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-slate-900">
                  {bookings.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4">
                <FileText size={17} className="text-primary" />
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Ready
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-slate-900">
                  {reportReadyCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <PromoBanner />

        {/* Booking list */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your activity</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Lab bookings
              </h2>
            </div>

            {!loading && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[176px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white/60"
                />
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {bookings.map((booking, index) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[2rem] border border-dashed border-slate-300 bg-white/55 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FlaskConical size={28} strokeWidth={1.6} />
              </div>

              <p className="eyebrow mt-5">No diagnostics yet</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                No lab tests booked yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Book your first test to start a trackable diagnostic journey
                with collection and report updates in one place.
              </p>

              <Link
                to="/patient/lab-tests"
                className="btn-primary mt-5 inline-flex"
              >
                Book a test
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>

        {/* Bottom reassurance */}
        <section className="mt-7 rounded-[2rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                One diagnostic record, from booking to report.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                Open any booking to see its collection timeline and available
                report.
              </p>
            </div>

            <Link
              to="/patient/health-vault"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary transition hover:gap-2.5"
            >
              Open Health Vault
              <ChevronRight size={13} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
