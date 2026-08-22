import { Link } from "react-router-dom";
import { Users, Stethoscope, ShieldCheck, Sparkles } from "lucide-react";
import PulseDivider from "../components/PulseDivider.jsx";

const SHOWCASE_CARDS = [
  {
    title: "Patient experience",
    description: "A polished patient journey with fast doctor discovery, appointment booking, lab tests, and order tracking.",
    items: [
      "Find verified doctors by specialty",
      "Book instant video consultations",
      "Track prescriptions and medicine orders",
    ],
    action: { label: "Preview patient flow", to: "/patient/doctors" },
    icon: Users,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Doctor console",
    description: "Efficient doctor workflow with next appointment highlights, profile review, and quick access to consultation rooms.",
    items: [
      "See today’s schedule at a glance",
      "Join consultations in one click",
      "Manage earnings and patient requests",
    ],
    action: { label: "Open doctor demo", to: "/doctor/dashboard" },
    icon: Stethoscope,
    color: "from-slate-700 to-slate-900",
  },
  {
    title: "Admin control",
    description: "A high-impact admin panel for doctor approvals, orders, complaints, lab bookings, and platform analytics.",
    items: [
      "Review doctor registrations",
      "Oversee orders and payouts",
      "Monitor platform health in real time",
    ],
    action: { label: "Show admin preview", to: "/login" },
    icon: ShieldCheck,
    color: "from-indigo-600 to-violet-600",
  },
];

export default function Showcase() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-panel p-10">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Showcase</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Patient, doctor and admin dashboards in one live demo.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Present the product to investors or stakeholders with a polished preview page that highlights the full ecosystem at once.
                This is the perfect route to share when you want to demonstrate all major user experiences in a single view.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/patient/doctors" className="btn-primary">Patient preview</Link>
                <Link to="/doctor/onboarding" className="btn-secondary">Doctor preview</Link>
                <Link to="/login" className="btn-outline">Admin preview</Link>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-4">
                <Sparkles size={28} className="text-emerald-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Demo-ready</p>
                  <h2 className="mt-2 text-2xl font-semibold">Instant showcase setup</h2>
                </div>
              </div>
              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-slate-800/90 p-5">
                  <p className="text-sm text-slate-300">Use the test login on the auth page and open this route to share the full experience with any stakeholder.</p>
                </div>
                <div className="rounded-3xl bg-slate-800/90 p-5">
                  <p className="text-sm text-slate-300">All three panels keep the current theme and feel native to the app’s visual language.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PulseDivider className="my-16" animated />

        <div className="grid gap-6 lg:grid-cols-3">
          {SHOWCASE_CARDS.map(({ title, description, items, action, icon: Icon, color }) => (
            <div key={title} className="glass-card p-8">
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${color} text-white`}>
                <Icon size={24} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={action.to} className="btn-secondary mt-8 inline-flex items-center gap-2">
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
