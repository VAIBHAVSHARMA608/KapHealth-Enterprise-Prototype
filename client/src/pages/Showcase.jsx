import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import PulseDivider from "../components/PulseDivider.jsx";
import Navbar from "../components/Navbar.jsx";

const SHOWCASE_CARDS = [
  {
    title: "Patient experience",
    description:
      "A polished patient journey with fast doctor discovery, appointment booking, lab tests, and order tracking.",
    items: [
      "Find verified doctors by specialty",
      "Book instant video consultations",
      "Track prescriptions and medicine orders",
    ],
    action: { label: "Preview patient flow", to: "/patient/doctors" },
    icon: Users,
    eyebrow: "01 / PATIENT",
    accent: "emerald",
    pattern: "grid",
  },
  {
    title: "Doctor console",
    description:
      "An efficient doctor workflow with schedule visibility, secure consultation access, patient context, and earnings.",
    items: [
      "See today's schedule at a glance",
      "Join consultations in one click",
      "Manage earnings and patient requests",
    ],
    action: { label: "Open doctor demo", to: "/doctor/dashboard" },
    icon: Stethoscope,
    eyebrow: "02 / CLINICIAN",
    accent: "slate",
    pattern: "diagonal",
  },
  {
    title: "Admin control",
    description:
      "A high-impact operations workspace for approvals, orders, complaints, lab bookings, payouts, and platform health.",
    items: [
      "Review doctor registrations",
      "Oversee orders and payouts",
      "Monitor platform health in real time",
    ],
    action: { label: "Show admin preview", to: "/login" },
    icon: ShieldCheck,
    eyebrow: "03 / OPERATIONS",
    accent: "indigo",
    pattern: "dots",
  },
];

const ACCENT = {
  emerald: {
    icon:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10",
    overlay:
      "bg-gradient-to-br from-[#0F6E5B] via-[#0B6453] to-[#083F37]",
    glow: "bg-emerald-300/20",
    button:
      "border-emerald-200/30 bg-white text-[#0F6E5B]",
  },
  slate: {
    icon:
      "bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-900/10",
    overlay:
      "bg-gradient-to-br from-[#1F2937] via-[#17212B] to-[#0F172A]",
    glow: "bg-slate-300/15",
    button:
      "border-white/20 bg-white text-slate-900",
  },
  indigo: {
    icon:
      "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10",
    overlay:
      "bg-gradient-to-br from-[#4338CA] via-[#4F46E5] to-[#312E81]",
    glow: "bg-violet-300/20",
    button:
      "border-white/20 bg-white text-indigo-700",
  },
};

function Pattern({ type, dark = false }) {
  if (type === "grid") {
    return (
      <span
        aria-hidden="true"
        className={[
          "absolute inset-0 opacity-40",
          dark
            ? "[background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)]"
            : "[background-image:linear-gradient(rgba(15,110,91,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,.10)_1px,transparent_1px)]",
          "[background-size:34px_34px]",
        ].join(" ")}
      />
    );
  }

  if (type === "diagonal") {
    return (
      <span
        aria-hidden="true"
        className={[
          "absolute inset-0 opacity-40",
          dark
            ? "[background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.08)_0,rgba(255,255,255,.08)_1px,transparent_1px,transparent_18px)]"
            : "[background-image:repeating-linear-gradient(135deg,rgba(15,23,42,.08)_0,rgba(15,23,42,.08)_1px,transparent_1px,transparent_18px)]",
        ].join(" ")}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={[
        "absolute inset-0 opacity-45",
        dark
          ? "[background-image:radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)]"
          : "[background-image:radial-gradient(rgba(79,70,229,.13)_1px,transparent_1px)]",
        "[background-size:18px_18px]",
      ].join(" ")}
    />
  );
}

function ShowcaseCard({
  title,
  description,
  items,
  action,
  icon: Icon,
  eyebrow,
  accent,
  pattern,
}) {
  const theme = ACCENT[accent];

  return (
    <article
      className={[
        "group/card relative min-h-[430px] overflow-hidden rounded-[2rem]",
        "border border-white/80 bg-white/75 p-7 sm:p-8",
        "shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl",
        "transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
        "hover:-translate-y-2 hover:shadow-[0_25px_70px_rgba(15,23,42,0.14)]",
      ].join(" ")}
    >
      {/* Decorative page pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover/card:opacity-0">
        <Pattern type={pattern} />
      </div>

      {/* Uiverse-inspired expanding corners */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute right-0 top-0 z-0 h-16 w-16 rounded-bl-[3rem] rounded-tr-[2rem]",
          theme.overlay,
          "origin-top-right scale-100",
          "transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          "group-hover/card:h-full group-hover/card:w-full group-hover/card:rounded-none",
        ].join(" ")}
      >
        <Pattern type={pattern} dark />
        <span
          className={[
            "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl",
            theme.glow,
          ].join(" ")}
        />
      </span>

      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12 rounded-tr-[2.5rem] rounded-bl-[2rem]",
          theme.overlay,
          "origin-bottom-left opacity-95",
          "transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          "group-hover/card:h-full group-hover/card:w-full group-hover/card:rounded-none",
        ].join(" ")}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span
            className={[
              "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
              theme.icon,
              "transition-all duration-500 group-hover/card:border-white/20 group-hover/card:bg-white/10 group-hover/card:text-white group-hover/card:shadow-lg",
            ].join(" ")}
          >
            <Icon size={21} strokeWidth={1.8} />
          </span>

          <span className="text-[9px] font-bold tracking-[0.16em] text-slate-300 transition-colors duration-500 group-hover/card:text-white/35">
            {eyebrow}
          </span>
        </div>

        <div className="mt-7">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 transition-colors duration-500 group-hover/card:text-white">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors duration-500 group-hover/card:text-white/60">
            {description}
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-slate-600 transition-colors duration-500 group-hover/card:text-white/75"
            >
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-primary transition-colors duration-500 group-hover/card:text-emerald-200"
                strokeWidth={1.8}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link
            to={action.to}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
              "text-xs font-semibold shadow-sm",
              "transition-all duration-300",
              theme.button,
              "hover:-translate-y-0.5 hover:shadow-lg",
              "group-hover/card:border-white/20",
            ].join(" ")}
          >
            {action.label}
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover/card:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Showcase() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F9F6]">
      <Navbar />
      {/* Exact visual language of the supplied grid-pattern reference */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 [background-image:linear-gradient(0deg,transparent_24%,rgba(15,110,91,.08)_25%,rgba(15,110,91,.08)_26%,transparent_27%,transparent_74%,rgba(15,110,91,.08)_75%,rgba(15,110,91,.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(15,110,91,.08)_25%,rgba(15,110,91,.08)_26%,transparent_27%,transparent_74%,rgba(15,110,91,.08)_75%,rgba(15,110,91,.08)_76%,transparent_77%,transparent)] [background-size:55px_55px]" />
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-120px] h-[480px] w-[480px] rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Hero */}
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="grid overflow-hidden rounded-[1.6rem] bg-white/50 lg:grid-cols-[1.25fr_.75fr]">
            <div className="relative p-7 sm:p-9 lg:p-12">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[4rem] bg-primary/[0.06]" />
              <Pattern type="grid" />

              <div className="relative z-10">
                <div className="glass-pill">
                  <Sparkles size={13} className="text-primary" />
                  Product showcase
                </div>

                <p className="eyebrow mt-7">KapHealth ecosystem</p>

                <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  One healthcare platform.
                  <span className="block text-primary">Three focused experiences.</span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Explore the patient journey, clinician workflow, and
                  operational control layer through one cohesive interface.
                  Built for a product demo that feels like a real platform,
                  not a collection of screenshots.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/patient/doctors" className="btn-primary group">
                    Patient preview
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link to="/doctor/onboarding" className="btn-secondary">
                    Doctor preview
                  </Link>

                  <Link to="/login" className="btn-outline">
                    Admin preview
                  </Link>
                </div>
              </div>
            </div>

            {/* Premium dark status panel */}
            <div className="relative overflow-hidden bg-[#0A3F36] p-7 text-white sm:p-9">
              <div className="absolute inset-0 opacity-60">
                <Pattern type="grid" dark />
              </div>

              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-emerald-200 backdrop-blur-xl">
                    <Sparkles size={20} />
                  </div>

                  <span className="rounded-full border border-emerald-200/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">
                    Demo ready
                  </span>
                </div>

                <div className="mt-auto pt-16">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/55">
                    Platform preview
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Seamless from sign-in to care.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    A connected product surface for patients, doctors, and
                    operators with a shared visual language.
                  </p>

                  <div className="mt-7 space-y-2">
                    {[
                      "Role-aware experiences",
                      "Secure consultation workflow",
                      "Unified healthcare operations",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.5 text-xs text-white/65"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-emerald-300"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-white/30">
                  <ShieldCheck size={13} />
                  Built around secure healthcare workflows
                </div>
              </div>
            </div>
          </div>
        </section>

        <PulseDivider className="my-12" animated />

        {/* Cards */}
        <section>
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Explore the platform</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Select an experience
              </h2>
            </div>

            <p className="max-w-md text-xs leading-5 text-slate-500 sm:text-right">
              Hover a panel to expand its visual system and reveal its full
              interaction layer.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {SHOWCASE_CARDS.map((card) => (
              <ShowcaseCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
