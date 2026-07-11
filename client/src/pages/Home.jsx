import { Link } from "react-router-dom";
import { Video, FileText, Package, ShieldCheck, Stethoscope } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import PulseDivider from "../components/PulseDivider.jsx";

const STEPS = [
  { icon: Stethoscope, title: "Book a check-up", body: "Pick a doctor by specialty, choose an open slot, pay the consult fee." },
  { icon: Video, title: "See them face to face", body: "Join a video call with live text chat, right from your browser." },
  { icon: FileText, title: "Get your e-prescription", body: "Your doctor issues a signed digital prescription before the call ends." },
  { icon: Package, title: "Order & track medicines", body: "One tap orders everything on your prescription. Watch it move to your door." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:pt-24">
        <p className="eyebrow mb-4">Consult · Prescribe · Deliver</p>
        <h1 className="max-w-3xl font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-6xl">
          See a doctor this afternoon.
          <br /> Get your medicine <span className="text-primary">by tomorrow.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          KapHealth connects you to verified doctors over video, in minutes — then turns their prescription
          straight into a tracked delivery to your door.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/patient/doctors" className="btn-primary">Find a doctor</Link>
          <Link to="/doctor/onboarding" className="btn-secondary">I'm a doctor — join KapHealth</Link>
        </div>
        <PulseDivider className="mt-14 opacity-70" animated />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium text-ink">How a check-up flows</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={20} />
              </div>
              <p className="mb-1 font-mono text-xs text-muted">0{i + 1}</p>
              <h3 className="font-display text-lg font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary"><ShieldCheck size={20} /><span className="font-semibold">Verified doctors only</span></div>
            <p className="max-w-md text-sm text-muted">
              Every doctor is reviewed against their medical registration before they can accept a single booking.
            </p>
          </div>
          <Link to="/login" className="btn-primary shrink-0">Log in with WhatsApp or Google</Link>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-center text-sm text-muted">
        © {new Date().getFullYear()} KapHealth. Not for medical emergencies — call your local emergency number.
      </footer>
    </div>
  );
}
