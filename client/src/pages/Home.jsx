import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import PulseDivider from "../components/PulseDivider.jsx";

const HERO_VIDEO =
  "https://videos.pexels.com/video-files/8375606/8375606-hd_1920_1080_25fps.mp4";

const HERO_POSTER =
  "https://images.pexels.com/videos/8375606/free-video-8375606.jpg?auto=compress&cs=tinysrgb&w=1600";

const TRUSTED_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    alt: "Healthcare professional using digital technology",
  },
  {
    src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=85",
    alt: "Doctor consulting with a patient",
  },
  {
    src: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1000&q=85",
    alt: "Medical professional in a clinical setting",
  },
];

const STEPS = [
  {
    icon: Stethoscope,
    number: "01",
    title: "Book a check-up",
    body: "Pick a doctor by specialty, choose an open slot, and confirm your consultation in minutes.",
    accent: "from-[#0F6E5B] to-[#0A4F42]",
  },
  {
    icon: Video,
    number: "02",
    title: "See them face to face",
    body: "Join a secure video call with live text chat directly from your browser.",
    accent: "from-[#176B68] to-[#0F5B59]",
  },
  {
    icon: FileText,
    number: "03",
    title: "Get your e-prescription",
    body: "Your doctor can issue a digital prescription before the consultation ends.",
    accent: "from-[#355C7D] to-[#2C4963]",
  },
  {
    icon: Package,
    number: "04",
    title: "Order & track medicines",
    body: "Turn your prescription into a tracked medicine order and follow it to your door.",
    accent: "from-[#416F6A] to-[#2E5550]",
  },
];

const SERVICES = [
  {
    eyebrow: "01 · CONSULT",
    title: "Talk to a doctor",
    description:
      "Verified doctors, clear availability, and secure browser-based consultations.",
    icon: Video,
    cta: "Find a doctor",
    to: "/patient/doctors",
    pattern: "grid",
    accent: "emerald",
  },
  {
    eyebrow: "02 · TEST",
    title: "Book lab tests",
    description:
      "Organize routine testing and keep your bookings connected to your care journey.",
    icon: HeartPulse,
    cta: "Explore lab tests",
    to: "/patient/lab-tests",
    pattern: "dots",
    accent: "blue",
  },
  {
    eyebrow: "03 · DELIVERY",
    title: "Get medicines delivered",
    description:
      "Browse healthcare essentials and keep medicine orders visible from checkout to delivery.",
    icon: Package,
    cta: "Visit store",
    to: "/patient/store",
    pattern: "diagonal",
    accent: "indigo",
  },
];

const ACCENTS = {
  emerald: {
    top: "from-[#0F6E5B] to-[#083F37]",
    icon: "bg-emerald-50 text-emerald-700",
    glow: "bg-emerald-300/20",
  },
  blue: {
    top: "from-[#176B68] to-[#123F58]",
    icon: "bg-cyan-50 text-cyan-700",
    glow: "bg-cyan-300/20",
  },
  indigo: {
    top: "from-[#4F46E5] to-[#312E81]",
    icon: "bg-indigo-50 text-indigo-700",
    glow: "bg-violet-300/20",
  },
};

function Pattern({ type, dark = false }) {
  const common = "pointer-events-none absolute inset-0";

  if (type === "dots") {
    return (
      <span
        aria-hidden="true"
        className={`${common} ${
          dark
            ? "[background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)]"
            : "[background-image:radial-gradient(rgba(15,110,91,.13)_1px,transparent_1px)]"
        } [background-size:18px_18px] opacity-40`}
      />
    );
  }

  if (type === "diagonal") {
    return (
      <span
        aria-hidden="true"
        className={`${common} ${
          dark
            ? "[background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.09)_0,rgba(255,255,255,.09)_1px,transparent_1px,transparent_18px)]"
            : "[background-image:repeating-linear-gradient(135deg,rgba(79,70,229,.09)_0,rgba(79,70,229,.09)_1px,transparent_1px,transparent_18px)]"
        } opacity-40`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${common} ${
        dark
          ? "[background-image:linear-gradient(rgba(255,255,255,.075)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.075)_1px,transparent_1px)]"
          : "[background-image:linear-gradient(rgba(15,110,91,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,.08)_1px,transparent_1px)]"
      } [background-size:34px_34px] opacity-40`}
    />
  );
}

function ServiceCard({ item }) {
  const Icon = item.icon;
  const accent = ACCENTS[item.accent];

  return (
    <article className="group relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/75 bg-white/70 p-7 shadow-[0_18px_55px_rgba(15,23,42,0.065)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_75px_rgba(15,23,42,0.13)]">
      {/* Quiet pattern state */}
      <div className="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-0">
        <Pattern type={item.pattern} />
      </div>

      {/* Uiverse-inspired expanding corner */}
      <div
        className={[
          "absolute right-0 top-0 z-0 h-14 w-14 overflow-hidden rounded-bl-[2.8rem] rounded-tr-[2rem]",
          "origin-top-right transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          "group-hover:h-full group-hover:w-full group-hover:rounded-none",
          accent.top && `bg-gradient-to-br ${accent.top}`,
        ].join(" ")}
      >
        <Pattern type={item.pattern} dark />
        <span className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl ${accent.glow}`} />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.icon} shadow-sm transition-all duration-500 group-hover:bg-white/10 group-hover:text-white`}
          >
            <Icon size={21} strokeWidth={1.8} />
          </span>

          <span className="text-[9px] font-bold tracking-[0.16em] text-slate-300 transition-colors duration-500 group-hover:text-white/40">
            {item.eyebrow}
          </span>
        </div>

        <h3 className="mt-7 text-2xl font-semibold tracking-tight text-slate-950 transition-colors duration-500 group-hover:text-white">
          {item.title}
        </h3>

        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 transition-colors duration-500 group-hover:text-white/60">
          {item.description}
        </p>

        <div className="mt-auto pt-8">
          <Link
            to={item.to}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group-hover:border-white/15 group-hover:text-slate-900"
          >
            {item.cta}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F8F5]">
      <Navbar />

      {/* Ambient page background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-64 top-24 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-56 top-[38%] h-[36rem] w-[36rem] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      {/* =========================================================
          HERO
         ========================================================= */}
      <main className="relative">
        <section className="mx-auto max-w-[1440px] px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="relative min-h-[670px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#0A3730] shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
            {/* Video background */}
            <div className="absolute inset-0">
              <video
                className="h-full w-full object-cover opacity-45"
                autoPlay
                loop
                muted
                playsInline
                poster={HERO_POSTER}
              >
                <source src={HERO_VIDEO} type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-r from-[#062D28] via-[#083E35]/85 to-[#0A3730]/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#052A25]/75 via-transparent to-[#052A25]/20" />
            </div>

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="absolute -bottom-32 right-12 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:46px_46px]" />
            </div>

            <div className="relative z-10 grid min-h-[670px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_.9fr] lg:p-12 xl:p-16">
              {/* Hero copy */}
              <div className="flex max-w-2xl flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/75 backdrop-blur-xl">
                  <Sparkles size={12} />
                  Smart healthcare · built around you
                </div>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/60">
                  Consult · Prescribe · Deliver
                </p>

                <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  See a doctor this afternoon.
                  <span className="block text-emerald-200">
                    Get your medicine by tomorrow.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  KapHealth connects you with verified doctors over secure
                  video, turns consultations into digital prescriptions, and
                  keeps your next steps in one connected healthcare journey.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/patient/doctors"
                    className="group flex items-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_rgba(255,255,255,.7),0_8px_18px_rgba(0,0,0,.16),0_-3px_4px_rgba(206,207,209,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_5px_4px_rgba(255,255,255,.8),0_12px_25px_rgba(0,0,0,.18),0_-4px_5px_rgba(206,207,209,.45)] active:translate-y-0"
                  >
                    <Stethoscope
                      size={16}
                      className="text-primary transition-transform duration-500 group-hover:rotate-[-8deg]"
                    />
                    Find a doctor
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    to="/doctor/onboarding"
                    className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15"
                  >
                    I’m a doctor
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-medium text-white/45">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-300/80" />
                    Secure consultations
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-300/80" />
                    Verified doctors
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={13} className="text-emerald-300/80" />
                    Fast scheduling
                  </span>
                </div>
              </div>

              {/* Floating glass stack */}
              <div className="relative hidden items-center justify-center lg:flex">
                <div className="absolute h-[430px] w-[320px] rounded-[2rem] border border-white/10 bg-white/[0.03] blur-sm" />

                <div className="container relative flex h-[510px] w-full items-center justify-center">
                  {[
                    {
                      r: -8,
                      image: TRUSTED_IMAGES[0].src,
                      title: "Virtual consultation",
                      copy: "Secure, browser-based care",
                    },
                    {
                      r: 0,
                      image: TRUSTED_IMAGES[1].src,
                      title: "Verified clinicians",
                      copy: "Care built on trust",
                    },
                    {
                      r: 8,
                      image: TRUSTED_IMAGES[2].src,
                      title: "Connected journey",
                      copy: "From consult to delivery",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      style={{ "--r": item.r }}
                      className="group absolute h-[330px] w-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,.25)] backdrop-blur-md transition-all duration-500 hover:z-30"
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-200/70">
                          {item.copy}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {item.title}
                        </p>
                      </div>

                      <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/80 backdrop-blur-xl">
                        <Play size={13} fill="currentColor" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <PulseDivider className="mx-auto my-10 max-w-6xl px-6 opacity-70" animated />

        {/* =========================================================
            FLOW
           ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">How care flows</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                One journey. Fewer handoffs.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">
              The experience follows the real patient journey, from finding
              the right clinician to getting the next step delivered.
            </p>
          </div>

          {/* Fan-style glass panels inspired by the supplied reference */}
          <div className="mt-9 rounded-[2rem] border border-white/75 bg-white/55 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="flex min-h-[360px] flex-col gap-2 md:flex-row md:items-stretch md:justify-center">
              {STEPS.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className={[
                      "group/step relative min-h-[260px] flex-1 overflow-hidden rounded-2xl",
                      "border border-white/50 bg-gradient-to-br",
                      step.accent,
                      "p-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.10)]",
                      "transition-[flex,transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
                      "hover:flex-[1.8] hover:-translate-y-1 hover:shadow-2xl",
                    ].join(" ")}
                  >
                    <div className="absolute inset-0 opacity-15">
                      <Pattern type={index % 2 === 0 ? "grid" : "diagonal"} dark />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-white/45">
                          {step.number}
                        </span>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl transition-transform duration-500 group-hover/step:scale-110">
                          <Icon size={18} />
                        </div>
                      </div>

                      <div className="mt-auto">
                        <h3 className="max-w-xs text-xl font-semibold tracking-tight">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-sm text-xs leading-5 text-white/55 transition-colors duration-500 group-hover/step:text-white/75">
                          {step.body}
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/45">
                          Learn more
                          <ArrowRight
                            size={12}
                            className="transition-transform duration-300 group-hover/step:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SERVICE CARDS
           ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="eyebrow">Care, connected</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Everything around the consultation.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.title} item={service} />
            ))}
          </div>
        </section>

        {/* =========================================================
            ADVERTISEMENT / FEATURED CARE
           ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/65 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative overflow-hidden bg-[#0C5147] p-7 text-white sm:p-9 lg:p-12">
                <div className="absolute inset-0 opacity-20">
                  <Pattern type="dots" dark />
                </div>

                <div className="relative z-10">
                  <span className="glass-pill border-white/10 bg-white/10 text-white">
                    <Sparkles size={12} className="text-emerald-200" />
                    Featured care
                  </span>

                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/60">
                    Your health deserves continuity
                  </p>

                  <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
                    From consultation to doorstep, keep everything in one
                    place.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                    Stay focused on the care decision while KapHealth keeps
                    the surrounding workflow connected.
                  </p>

                  <Link
                    to="/patient/doctors"
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_5px_4px_rgba(255,255,255,.5),0_8px_18px_rgba(0,0,0,.13)] transition hover:-translate-y-0.5 hover:text-primary"
                  >
                    Start with a doctor
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden">
                <img
                  src={TRUSTED_IMAGES[0].src}
                  alt={TRUSTED_IMAGES[0].alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/5 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-xl sm:inset-x-7 sm:bottom-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Video size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        Secure virtual care
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/60">
                        Video · Chat · Prescription
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-semibold text-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TRUST
           ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/75 bg-white/65 p-7 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-9">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck size={19} />
                  <span className="text-sm font-semibold">
                    Verified doctors only
                  </span>
                </div>

                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950">
                  Confidence at every step.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Doctors are reviewed against their medical registration
                  before accepting bookings, giving the platform a stronger
                  foundation for trusted care.
                </p>
              </div>

              <Link
                to="/login"
                className="btn-secondary w-fit whitespace-nowrap"
              >
                Join KapHealth
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 py-10 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} KapHealth. Not for medical emergencies —
          call your local emergency number.
        </p>
      </footer>
    </div>
  );
}
