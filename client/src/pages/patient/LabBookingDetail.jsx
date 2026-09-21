import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  Home,
  LockKeyhole,
  MapPin,
  PackageCheck,
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

const STEPS = [
  "booked",
  "sample_collected",
  "processing",
  "report_ready",
];

const LAB_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1400&q=85";

const LAB_VIDEO_PAGE =
  "https://www.pexels.com/search/videos/laboratory/";

function TrackingTimeline({ status }) {
  const stepIndex = STEPS.indexOf(status);

  return (
    <div className="relative mt-7 overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/55 p-5">
      <div className="absolute left-9 right-9 top-[43px] h-px bg-slate-200" />

      <div className="relative grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => {
          const completed = index <= stepIndex;

          return (
            <div
              key={step}
              className="group flex min-w-0 flex-col items-center text-center"
            >
              <div
                className={[
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                  completed
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/15"
                    : "border-slate-200 bg-white text-slate-300",
                  completed && index === stepIndex
                    ? "ring-4 ring-primary/10"
                    : "",
                ].join(" ")}
              >
                {completed ? (
                  index === stepIndex ? (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  ) : (
                    <Check size={15} />
                  )
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                )}
              </div>

              <p
                className={[
                  "mt-3 max-w-[110px] text-[9px] font-semibold uppercase leading-4 tracking-[0.08em]",
                  completed ? "text-slate-800" : "text-slate-400",
                ].join(" ")}
              >
                {LABEL[step]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestRow({ test, index }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-white/75 hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-300 group-hover:scale-105">
          <TestTube2 size={16} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
            {test.name}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-slate-400">
            Laboratory test {String(index + 1).padStart(2, "0")}
          </p>
        </div>
      </div>

      <span className="shrink-0 font-mono text-sm font-semibold text-slate-800">
        ₹{test.price}
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/80">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} className="text-primary" />
        <p className="text-[9px] font-bold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function LabBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBooking() {
      try {
        const { data } = await api.get(`/lab-tests/bookings/${id}`);

        if (!mounted) return;

        setBooking(data.booking);
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load this lab booking."
        );
      }
    }

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [id]);

  const stepIndex = useMemo(
    () => (booking ? STEPS.indexOf(booking.status) : -1),
    [booking]
  );

  if (!booking) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />

        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {error ? (
                <FlaskConical size={24} />
              ) : (
                <FlaskConical size={24} className="animate-pulse" />
              )}
            </div>

            <p className="eyebrow mt-5">
              {error ? "Booking unavailable" : "Lab booking"}
            </p>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {error ? "Couldn't open booking" : "Loading your booking"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "We're securely retrieving your test and collection details."}
            </p>

            {error && (
              <Link
                to="/patient/lab-bookings"
                className="btn-secondary mt-6 inline-flex"
              >
                <ArrowLeft size={15} />
                Back to lab bookings
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  const isCancelled = booking.status === "cancelled";
  const reportReady = Boolean(booking.reportUrl);

  return (
    <div className="lab-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .lab-page {
          background:
            radial-gradient(circle at 8% 8%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 92% 30%, rgba(16,185,129,.055), transparent 28rem),
            #f4f9f6;
        }

        .lab-page::before {
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

        .corner-lab {
          position: relative;
          overflow: hidden;
        }

        .corner-lab::before,
        .corner-lab::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .corner-lab::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .corner-lab::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.03);
        }

        .corner-lab:hover::before,
        .corner-lab:hover::after {
          width: 80%;
          height: 80%;
          border-radius: 2rem;
        }

        .promo-shine::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.18),
            transparent
          );
          animation: lab-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .report-button {
          position: relative;
          isolation: isolate;
        }

        .report-button::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f6e5b, #26a88a, #92dfca, #0f6e5b);
          background-size: 300% 300%;
          animation: lab-gradient 7s ease infinite;
          filter: blur(5px);
          opacity: .58;
        }

        @keyframes lab-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @keyframes lab-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-shine::after,
          .report-button::before {
            animation: none !important;
          }

          .corner-lab::before,
          .corner-lab::after {
            transition: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-16 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/patient/lab-bookings"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Lab bookings
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
            <ShieldCheck size={13} className="text-primary" />
            Secure lab record
          </div>
        </div>

        {/* Hero */}
        <section className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <div className="corner-lab rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_22px_70px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="glass-pill inline-flex items-center gap-1.5">
                    <FlaskConical size={13} className="text-primary" />
                    Lab booking
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
                    {booking.bookingNumber}
                  </span>
                </div>

                <p className="eyebrow mt-7">Diagnostic care</p>

                <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                  Your lab journey,
                  <span className="block text-primary">
                    clearly tracked.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  {booking.bookingFor?.type === "dependent"
                    ? `This booking is arranged for ${booking.bookingFor.dependentName}.`
                    : "Your lab test booking, collection details, and report are connected in one place."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={TONE[booking.status]}>
                    {LABEL[booking.status] || booking.status}
                  </StatusBadge>

                  {!isCancelled && (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/[0.05] px-3 py-1.5 text-[9px] font-semibold text-primary">
                      <Sparkles size={11} />
                      {stepIndex >= 0
                        ? `${stepIndex + 1} / ${STEPS.length} complete`
                        : "In progress"}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-primary to-emerald-800 text-white shadow-lg shadow-primary/15 sm:flex">
                <FlaskConical size={28} strokeWidth={1.6} />
              </div>
            </div>
          </div>

          {/* Advertising panel */}
          <aside className="promo-shine group relative min-h-[300px] overflow-hidden rounded-[2rem] shadow-[0_24px_75px_rgba(15,23,42,.12)]">
            <img
              src={LAB_PROMO_IMAGE}
              alt="Laboratory healthcare professional"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] backdrop-blur-md">
                  KapHealth Diagnostics
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <ShieldCheck size={16} />
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  Diagnostic care
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Test. Track. Understand.
                </h2>

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Keep collection updates and digital reports together for
                  easier follow-up care.
                </p>

                <a
                  href={LAB_VIDEO_PAGE}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  Explore lab videos
                  <ChevronRight size={13} />
                </a>
              </div>
            </div>
          </aside>
        </section>

        {/* Status timeline */}
        {!isCancelled && (
          <SectionShell className="mt-5 p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Status timeline</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                    Where your booking stands
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <Clock3 size={12} className="text-primary" />
                  Live booking status
                </div>
              </div>

              <TrackingTimeline status={booking.status} />
            </div>
          </SectionShell>
        )}

        {/* Main content */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-5">
            {/* Tests */}
            <SectionShell className="corner-lab p-6 sm:p-7">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Step details</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Tests included
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TestTube2 size={17} />
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {booking.tests.map((test, index) => (
                    <TestRow key={`${test.name}-${index}`} test={test} index={index} />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Total booking value
                  </span>

                  <span className="font-mono text-lg font-bold text-slate-900">
                    ₹{booking.total}
                  </span>
                </div>
              </div>
            </SectionShell>

            {/* Collection details */}
            <SectionShell className="corner-lab p-6 sm:p-7">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Collection</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Collection details
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Truck size={17} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <StatCard
                    icon={Clock3}
                    label="Scheduled"
                    value={`${new Date(
                      booking.scheduledDate
                    ).toLocaleDateString()} · ${booking.timeSlot}`}
                  />

                  <StatCard
                    icon={MapPin}
                    label="Collection address"
                    value={`${booking.collectionAddress?.line1 || ""}${
                      booking.collectionAddress?.city
                        ? `, ${booking.collectionAddress.city}`
                        : ""
                    }`}
                  />

                  <StatCard
                    icon={Home}
                    label="Collection type"
                    value="Scheduled sample collection"
                  />

                  <StatCard
                    icon={PackageCheck}
                    label="Patient"
                    value={
                      booking.bookingFor?.type === "dependent"
                        ? booking.bookingFor.dependentName
                        : "You"
                    }
                  />
                </div>
              </div>
            </SectionShell>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_22px_70px_rgba(15,23,42,.09)] backdrop-blur-2xl">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-6 text-white">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:18px_18px]" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                      <FlaskConical size={17} />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/55">
                      Booking summary
                    </span>
                  </div>

                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200/55">
                    Total
                  </p>

                  <p className="mt-1 font-mono text-3xl font-semibold">
                    ₹{booking.total}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    {booking.tests.length}{" "}
                    {booking.tests.length === 1 ? "test" : "tests"} included
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Booking</span>
                    <span className="font-semibold text-slate-800">
                      {booking.bookingNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge tone={TONE[booking.status]}>
                      {LABEL[booking.status] || booking.status}
                    </StatusBadge>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/70 pt-4">
                    <span className="text-sm font-semibold text-slate-900">
                      Payable
                    </span>
                    <span className="font-mono text-xl font-bold text-slate-950">
                      ₹{booking.total}
                    </span>
                  </div>
                </div>

                {reportReady && (
                  <a
                    href={booking.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="report-button mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5"
                  >
                    <FileText size={16} />
                    View lab report
                    <ArrowRight size={15} />
                  </a>
                )}

                {!reportReady && !isCancelled && (
                  <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                    <div className="flex items-start gap-2.5">
                      <FileText
                        size={15}
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Report not ready yet
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Your digital report will appear here automatically
                          once the laboratory marks it ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-xs leading-5 text-red-700">
                    This laboratory booking has been cancelled.
                  </div>
                )}

                <div className="mt-5 border-t border-slate-200/70 pt-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <LockKeyhole size={12} className="text-primary/70" />
                    Secure patient record
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck size={12} className="text-primary/70" />
                    Connected to your KapHealth account
                  </div>
                </div>

                <Link
                  to="/patient/lab-bookings"
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-primary"
                >
                  Back to all lab bookings
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom care banner */}
        <section className="mt-7 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary to-emerald-800 p-6 text-white shadow-[0_25px_75px_rgba(15,110,91,.17)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[.15em]">
                  Connected care
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Your results belong in the bigger picture.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Keep lab reports alongside your appointments, health records,
                and wellness journey for a more complete care experience.
              </p>
            </div>

            <Link
              to="/patient/health-vault"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Open Health Vault
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionShell({ children, className = "" }) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2rem] border border-white/80",
        "bg-white/65 shadow-[0_20px_65px_rgba(15,23,42,.07)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}
