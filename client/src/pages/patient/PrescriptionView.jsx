import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  HeartPulse,
  LockKeyhole,
  Pill,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import PulseDivider from "../../components/PulseDivider.jsx";
import api from "../../services/api.js";

const RX_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=85";

function MedicineCard({ medicine, index }) {
  return (
    <div className="medicine-item group relative overflow-hidden rounded-[1.5rem] border border-slate-200/75 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_rgba(15,110,91,.08)] sm:p-5">
      <span className="medicine-item-corner medicine-item-corner-top" />
      <span className="medicine-item-corner medicine-item-corner-bottom" />

      <div className="relative z-10 flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
          <Pill size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[.13em] text-slate-300">
              Medication {String(index + 1).padStart(2, "0")}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-semibold text-emerald-700">
              <BadgeCheck size={10} />
              Prescribed
            </span>
          </div>

          <h3 className="mt-2 text-sm font-semibold text-slate-900 transition group-hover:text-primary">
            {medicine.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">
              {medicine.dosage}
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>{medicine.frequency}</span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>{medicine.durationDays} days</span>
          </div>

          {medicine.instructions && (
            <div className="mt-3 rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-[.12em] text-primary/70">
                Instructions
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                {medicine.instructions}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 h-px bg-slate-100 transition group-hover:bg-primary/10" />
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/75 bg-white/60 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-primary">
          <Icon size={14} />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function PrescriptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPrescription() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/prescriptions/${id}`);

        if (!mounted) return;

        setRx(data.prescription);
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load this prescription."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPrescription();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
        <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] border border-white/80 bg-white/65 p-8 shadow-sm backdrop-blur-2xl">
            <div className="h-4 w-32 rounded-full bg-slate-200" />
            <div className="mt-4 h-10 w-2/3 rounded-xl bg-slate-200" />
            <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-slate-200" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-32 rounded-2xl bg-slate-100" />
              <div className="h-32 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !rx) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
          <div className="rounded-[2rem] border border-white/80 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileText size={24} />
            </div>

            <p className="eyebrow mt-5">Prescription unavailable</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              We couldn't open this prescription.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "The prescription record could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-primary mt-6 inline-flex"
            >
              <ArrowLeft size={15} />
              Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const issuedDate = rx.signedAt
    ? new Date(rx.signedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date unavailable";

  const followUpDate = rx.followUpDate
    ? new Date(rx.followUpDate).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="prescription-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .prescription-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 93% 25%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .prescription-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .34;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .prescription-card {
          position: relative;
          overflow: hidden;
        }

        .prescription-card::before,
        .prescription-card::after {
          content: "";
          position: absolute;
          width: 17%;
          height: 17%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .prescription-card::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .prescription-card::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.03);
        }

        .prescription-card:hover::before,
        .prescription-card:hover::after {
          width: 72%;
          height: 72%;
          border-radius: 2rem;
        }

        .medicine-item {
          position: relative;
        }

        .medicine-item-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.035);
          transition: all .4s cubic-bezier(.22,1,.36,1);
        }

        .medicine-item-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.5rem 0 100%;
        }

        .medicine-item-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.5rem;
          background: rgba(15,110,91,.025);
        }

        .medicine-item:hover .medicine-item-corner {
          width: 72%;
          height: 72%;
          border-radius: 1.5rem;
        }

        .rx-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.18),
            transparent
          );
          animation: rx-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .rx-cta {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .rx-cta::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #0f6e5b,
            #42bea3,
            #93e3d1,
            #0f6e5b
          );
          background-size: 300% 300%;
          animation: rx-gradient 7s ease infinite;
          filter: blur(5px);
          opacity: .55;
        }

        @keyframes rx-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @keyframes rx-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .prescription-card::before,
          .prescription-card::after,
          .medicine-item-corner,
          .rx-promo::after,
          .rx-cta::before {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back
          </button>
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main prescription */}
          <div className="prescription-card rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_25px_75px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-8 lg:p-9">
            <div className="relative z-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill inline-flex items-center gap-1.5">
                      <FileCheck2 size={13} className="text-primary" />
                      e-Prescription
                    </span>

                    {rx.isOrdered && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700">
                        <CheckCircle2 size={11} />
                        Order placed
                      </span>
                    )}
                  </div>

                  <p className="eyebrow mt-6">Prescription record</p>

                  <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
                    Your care plan,
                    <span className="block text-primary">
                      clearly documented.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Issued on {issuedDate}. Review your diagnosis, medicines,
                    instructions, and follow-up details below.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:w-[245px]">
                  <SummaryTile
                    icon={CalendarDays}
                    label="Issued"
                    value={issuedDate.split(" ").slice(0, 2).join(" ")}
                  />
                  <SummaryTile
                    icon={Pill}
                    label="Medicines"
                    value={`${rx.medicines?.length || 0} prescribed`}
                  />
                </div>
              </div>

              <PulseDivider className="my-7 opacity-35" animated />

              {rx.diagnosis && (
                <section className="rounded-[1.7rem] border border-primary/10 bg-primary/[0.035] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <Stethoscope size={19} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-primary">
                        Clinical context
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        Diagnosis
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {rx.diagnosis}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <section className="mt-7">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Medication plan</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Prescribed medicines
                    </h2>
                  </div>

                  <span className="rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
                    {rx.medicines?.length || 0} items
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {rx.medicines?.map((medicine, index) => (
                    <MedicineCard
                      key={`${medicine.name}-${index}`}
                      medicine={medicine}
                      index={index}
                    />
                  ))}
                </div>
              </section>

              {rx.notesForPatient && (
                <section className="mt-7 rounded-[1.7rem] border border-slate-200/75 bg-white/60 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <FileText size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-amber-700/70">
                        Doctor notes
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        Notes for you
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {rx.notesForPatient}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {followUpDate && (
                <section className="mt-7 rounded-[1.7rem] border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[.14em] text-emerald-700/70">
                        Follow-up
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        Recommended for {followUpDate}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Side rail */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rx-promo group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_26px_80px_rgba(15,23,42,.14)]">
              <img
                src={RX_PROMO_IMAGE}
                alt="Prescription medicines"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/10" />

              <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] backdrop-blur-md">
                    KapHealth Pharmacy
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <ShoppingCart size={15} />
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200/90">
                    Continue your care
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Turn your prescription into a delivery.
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Review available medicines and place a pharmacy order
                    directly from this prescription.
                  </p>

                  <button
                    type="button"
                    disabled={rx.isOrdered}
                    onClick={() =>
                      navigate(`/patient/order/${rx._id}`)
                    }
                    className="rx-cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart size={14} />
                    {rx.isOrdered
                      ? "Medicines already ordered"
                      : "Order medicines"}
                    {!rx.isOrdered && <ArrowRight size={13} />}
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_20px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Prescription status</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {rx.isOrdered ? "Order connected" : "Ready to order"}
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {rx.isOrdered ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <Pill size={17} />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <StatusRow
                  done
                  title="Prescription issued"
                  detail={issuedDate}
                />

                <StatusRow
                  done={Boolean(rx.medicines?.length)}
                  title="Medicine plan"
                  detail={`${rx.medicines?.length || 0} prescribed`}
                />

                <StatusRow
                  done={Boolean(rx.isOrdered)}
                  title="Pharmacy order"
                  detail={rx.isOrdered ? "Order placed" : "Not ordered yet"}
                />
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LockKeyhole size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Keep this record handy
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Your e-prescription remains available in your KapHealth
                    care journey.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>

        {/* Actions */}
        <section className="mt-6 rounded-[2rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCheck2 size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Keep your prescription accessible
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Download the signed prescription PDF for your records.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {rx.pdfUrl && (
                <a
                  href={rx.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              )}

              <button
                type="button"
                onClick={() => navigate("/patient/doctors")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Book another consultation
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <ShieldCheck size={11} className="text-primary/70" />
          KapHealth · connected prescription care
          <Sparkles size={11} className="text-primary/50" />
        </div>
      </main>
    </div>
  );
}

function StatusRow({ done, title, detail }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          done
            ? "bg-primary text-white"
            : "bg-slate-100 text-slate-300",
        ].join(" ")}
      >
        {done ? <Check size={13} /> : <span className="h-2 w-2 rounded-full bg-current" />}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
