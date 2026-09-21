import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  IndianRupee,
  Play,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const DOCTOR_AD_IMAGE =
  "https://digitalmedicina.com.br/wp-content/uploads/2024/12/doctor-offering-medical-teleconsultation-1024x683.jpg";

const WELLNESS_AD_IMAGE =
  "https://4mama.com.ua/upload/rimg/osnovy-bystrogo-i-bezopasnogo-pohudeniya-2.jpg";

const VIDEO_PAGE =
  "https://www.pexels.com/video/a-person-having-online-consultation-with-a-doctor-8375447/";

function DoctorCard({ doctor }) {
  const avatar =
    doctor.user.avatarUrl ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      doctor.user.name
    )}`;

  return (
    <Link
      to={`/patient/doctors/${doctor.user._id}`}
      className="doctor-tilt group relative block h-full min-h-[285px] [perspective:1000px]"
    >
      <div className="doctor-card relative h-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,.07)] backdrop-blur-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(3deg)_rotateY(-4deg)_translateY(-5px)] group-hover:shadow-[0_28px_70px_rgba(15,110,91,.14)]">
        <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-primary/[0.08] blur-2xl transition duration-500 group-hover:scale-150" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="relative">
            <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-primary/40 to-emerald-200/10 opacity-0 blur transition group-hover:opacity-100" />
            <img
              src={avatar}
              alt=""
              className="relative h-20 w-20 rounded-[1.25rem] border-4 border-white object-cover shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
              <BadgeCheck size={12} />
            </span>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            <Star size={11} fill="currentColor" />
            {doctor.ratingAverage || "New"}
          </span>
        </div>

        <div className="relative z-10 mt-5">
          <h3 className="font-display text-xl font-semibold text-ink transition group-hover:text-primary">
            {doctor.user.name}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-primary/80">
            {doctor.specializations.join(" · ")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
              <Video size={12} />
              Video consult
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
              <CalendarCheck size={12} />
              Verified
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">
                Consultation
              </p>
              <p className="mt-1 flex items-center gap-0.5 font-mono text-base font-bold text-slate-900">
                <IndianRupee size={14} />
                {doctor.consultationFee}
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      </div>
    </Link>
  );
}

function PromoBanner() {
  return (
    <section className="promo-banner relative mt-7 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_25px_80px_rgba(15,23,42,.16)]">
      <div className="absolute inset-0">
        <img
          src={DOCTOR_AD_IMAGE}
          alt="Doctor providing a telemedicine consultation"
          className="h-full w-full object-cover opacity-50 transition duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
      </div>

      <div className="relative z-10 grid min-h-[285px] items-center lg:grid-cols-[1fr_280px]">
        <div className="max-w-2xl p-7 text-white sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-emerald-300">
              KapHealth Care
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/60">
              Verified doctors
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Healthcare, without the waiting room.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
            Book a verified doctor, join a secure video consultation, and
            keep your care journey in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Find a doctor
              <ArrowRight size={14} />
            </Link>

            <a
              href={VIDEO_PAGE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <Play size={13} fill="currentColor" />
              Watch consultation demo
            </a>
          </div>
        </div>

        <div className="hidden h-full min-h-[285px] items-end justify-end p-6 lg:flex">
          <div className="w-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={DOCTOR_AD_IMAGE}
                alt=""
                className="h-full w-full object-cover"
              />
              <a
                href={VIDEO_PAGE}
                target="_blank"
                rel="noreferrer"
                aria-label="Watch telemedicine video"
                className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition hover:bg-slate-950/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-xl transition hover:scale-110">
                  <Play size={18} fill="currentColor" />
                </span>
              </a>
            </div>

            <div className="p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-300">
                Video consult
              </p>
              <p className="mt-1 text-xs text-white/60">
                See how remote care works.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WellnessAd() {
  return (
    <aside className="wellness-ad group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_18px_55px_rgba(15,23,42,.07)] backdrop-blur-xl">
      <div className="relative h-44 overflow-hidden">
        <img
          src={WELLNESS_AD_IMAGE}
          alt="Healthy meal spread"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-primary">
          Wellness
        </span>

        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-[9px] uppercase tracking-[.14em] text-white/60">
            Healthy habits
          </p>
          <p className="mt-1 text-lg font-semibold">
            Eat better. Feel better.
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs leading-5 text-slate-500">
          Pair your consultation with nutrition tracking and personalised
          wellness tools.
        </p>

        <Link
          to="/patient/wellness/diet-planner"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:gap-2.5"
        >
          Explore wellness
          <ChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);

      api
        .get("/doctors", { params: { search } })
        .then(({ data }) => setDoctors(data.doctors))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="doctor-list-page min-h-screen overflow-hidden">
      <Navbar />

      <style>{`
        .doctor-list-page {
          background:
            radial-gradient(circle at 8% 8%, rgba(15,110,91,.08), transparent 28rem),
            radial-gradient(circle at 92% 30%, rgba(16,185,129,.06), transparent 26rem),
            #f8fafc;
        }

        .doctor-list-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .45;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }

        .search-shell {
          position: relative;
          overflow: hidden;
        }

        .search-shell::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from 90deg,
            transparent,
            rgba(15,110,91,.15),
            transparent 30%
          );
          animation: search-spin 7s linear infinite;
        }

        .search-shell > * {
          position: relative;
          z-index: 1;
        }

        .promo-banner::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -20%;
          width: 18%;
          height: 200%;
          transform: rotate(20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.15),
            transparent
          );
          animation: banner-shine 6s ease-in-out infinite;
        }

        @keyframes search-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes banner-shine {
          0%, 50% { left: -25%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .search-shell::before,
          .promo-banner::after {
            animation: none;
          }
        }
      `}</style>

      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_20px_70px_rgba(15,23,42,.06)] backdrop-blur-2xl sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Verified care
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-700">
                Video consultations
              </span>
            </div>

            <p className="eyebrow mt-6">Find a doctor</p>

            <h1 className="mt-1 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Meet the right doctor.
              <span className="block text-primary">
                Book when you're ready.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Browse verified specialists, compare consultation fees, and
              choose a doctor for a secure online consultation.
            </p>

            <div className="search-shell mt-7 max-w-2xl rounded-[1.25rem] border border-slate-200/80 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,.06)]">
              <div className="flex items-center">
                <Search
                  className="ml-3 shrink-0 text-primary/60"
                  size={18}
                />
                <input
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-slate-400"
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mr-2 rounded-full px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <WellnessAd />
        </section>

        <PromoBanner />

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Available specialists</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                {search ? `Results for "${search}"` : "Verified doctors"}
              </h2>
            </div>

            {!loading && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}
              </span>
            )}
          </div>

          {loading && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-[285px] animate-pulse rounded-[2rem] border border-slate-200 bg-white/70"
                />
              ))}
            </div>
          )}

          {!loading && doctors.length === 0 && (
            <div className="mt-5 rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope size={25} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                No doctors found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Try another name or specialty, or check back soon for newly
                verified doctors.
              </p>
            </div>
          )}

          {!loading && doctors.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor._id} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-9 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary to-emerald-800 p-7 text-white shadow-[0_25px_70px_rgba(15,110,91,.18)] sm:p-9">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Stethoscope size={18} />
                <span className="text-xs font-bold uppercase tracking-[.16em]">
                  KapHealth
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Need care but don't know where to start?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                Start with a verified specialist and continue your journey
                through consultation, prescriptions, and wellness tools.
              </p>
            </div>

            <Link
              to="/patient/wellness/diet-planner"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-primary transition hover:-translate-y-1 hover:shadow-xl"
            >
              Explore wellness
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
