import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
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
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const TIME_SLOTS = [
  "07:00 AM - 09:00 AM",
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
];

const LAB_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1400&q=85";

const LAB_PROMO_VIDEO_PAGE =
  "https://www.pexels.com/search/videos/laboratory/";

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ScheduleCard({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? "border-primary/30 bg-primary text-white shadow-[0_12px_30px_rgba(15,110,91,.18)]"
          : "border-slate-200/80 bg-white/65 text-slate-700 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white hover:shadow-md",
      ].join(" ")}
    >
      <span
        className={[
          "absolute -right-8 -top-8 h-16 w-16 rounded-full transition-transform duration-500",
          selected
            ? "bg-white/10 group-hover:scale-[4]"
            : "bg-primary/[0.06] group-hover:scale-[3.2]",
        ].join(" ")}
      />

      <span className="relative z-10 flex items-center gap-2">
        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-lg",
            selected
              ? "bg-white/15"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <Clock3 size={14} />
        </span>

        <span className="text-xs font-semibold">{value}</span>
      </span>

      {selected && (
        <span className="relative z-10 mt-3 flex items-center gap-1.5 text-[9px] font-semibold text-white/65">
          <Check size={11} />
          Selected
        </span>
      )}
    </button>
  );
}

function PaymentOption({
  selected,
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex min-h-[96px] items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? "border-primary/25 bg-primary/[0.045] shadow-[0_12px_28px_rgba(15,110,91,.08)]"
          : "border-slate-200/80 bg-white/60 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "absolute -right-8 -top-8 h-16 w-16 rounded-full transition-all duration-500",
          selected
            ? "scale-[3.5] bg-primary/[0.07]"
            : "scale-0 bg-primary/[0.06] group-hover:scale-[3]",
        ].join(" ")}
      />

      <div
        className={[
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          selected
            ? "bg-primary text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {description}
        </p>
      </div>

      <span
        className={[
          "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border transition",
          selected
            ? "border-primary bg-primary"
            : "border-slate-300 bg-white",
        ].join(" ")}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}

function TestSummaryRow({ test }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition hover:border-primary/15 hover:bg-white/75">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TestTube2 size={16} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
            {test.name}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-slate-400">
            Diagnostic test
          </p>
        </div>
      </div>

      <span className="shrink-0 font-mono text-sm font-semibold text-slate-900">
        ₹{test.price}
      </span>
    </div>
  );
}

export default function LabTestCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tests, setTests] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(tomorrow());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kap_lab_selection");

      if (!raw) {
        navigate("/patient/lab-tests", { replace: true });
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        navigate("/patient/lab-tests", { replace: true });
        return;
      }

      setTests(parsed);
    } catch {
      sessionStorage.removeItem("kap_lab_selection");
      navigate("/patient/lab-tests", { replace: true });
    }
  }, [navigate]);

  function updateAddress(field, value) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      const { data } = await api.post("/lab-tests/bookings", {
        testIds: tests.map((test) => test._id),
        scheduledDate,
        timeSlot,
        collectionAddress: address,
        paymentMethod,
        bookingFor,
      });

      sessionStorage.removeItem("kap_lab_selection");

      if (paymentMethod === "cod" || data.devMode) {
        navigate(`/patient/lab-bookings/${data.booking._id}`);
        return;
      }

      if (!window.Razorpay) {
        setError(
          "Payment SDK not loaded. Add the Razorpay checkout script to index.html."
        );
        setPlacing(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth Diagnostics",
        description: "Laboratory testing",
        order_id: data.razorpayOrderId,
        handler: async () => {
          navigate(`/patient/lab-bookings/${data.booking._id}`);
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
        prefill: {
          name: user?.name,
          contact: address.phone,
        },
        theme: {
          color: "#0F6E5B",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment could not be completed."
        );
        setPlacing(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't complete the booking."
      );
      setPlacing(false);
    }
  }

  const total = useMemo(
    () =>
      tests.reduce(
        (sum, test) => sum + Number(test.price || 0),
        0
      ),
    [tests]
  );

  if (tests.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="lab-checkout-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .lab-checkout-page {
          background:
            radial-gradient(circle at 8% 7%, rgba(15,110,91,.08), transparent 29rem),
            radial-gradient(circle at 92% 28%, rgba(16,185,129,.055), transparent 27rem),
            #f4f9f6;
        }

        .lab-checkout-page::before {
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
          position: relative;
          overflow: hidden;
        }

        .lab-corner::before,
        .lab-corner::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .lab-corner::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .lab-corner::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.03);
        }

        .lab-corner:hover::before,
        .lab-corner:hover::after {
          width: 78%;
          height: 78%;
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
          animation: lab-checkout-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .submit-button {
          position: relative;
          isolation: isolate;
        }

        .submit-button::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #0f6e5b,
            #34b399,
            #95e4d0,
            #0f6e5b
          );
          background-size: 300% 300%;
          animation: lab-checkout-gradient 7s ease infinite;
          filter: blur(5px);
          opacity: .6;
        }

        @keyframes lab-checkout-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @keyframes lab-checkout-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lab-corner::before,
          .lab-corner::after,
          .promo-shine::after,
          .submit-button::before {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-16 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/patient/lab-tests"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to lab tests
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <LockKeyhole size={13} />
                Diagnostic checkout
              </p>

              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Confirm your lab booking.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Select a collection slot, add your address, choose payment,
                and complete your diagnostic booking.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl">
              <ShieldCheck size={13} className="text-primary" />
              Secure booking
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center">
            <div className="flex flex-1 items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                <Check size={13} />
              </span>
              <span className="text-[11px] font-semibold text-slate-800">
                Tests
              </span>
            </div>

            <div className="h-px w-8 bg-primary/20 sm:w-20" />

            <div className="flex flex-1 items-center justify-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                2
              </span>
              <span className="text-[11px] font-semibold text-slate-800">
                Schedule
              </span>
            </div>

            <div className="h-px w-8 bg-primary/20 sm:w-20" />

            <div className="flex flex-1 items-center justify-end gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold text-primary">
                3
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Payment
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            {/* Left */}
            <div className="space-y-5">
              {/* Tests */}
              <SectionShell className="lab-corner p-6 sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">01 · Selection</p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900">
                        Tests in this booking
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FlaskConical size={17} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {tests.map((test) => (
                      <TestSummaryRow
                        key={test._id}
                        test={test}
                      />
                    ))}
                  </div>
                </div>
              </SectionShell>

              {/* Booking for */}
              <SectionShell className="lab-corner p-6 sm:p-7">
                <div className="relative z-10">
                  <p className="eyebrow">02 · Patient</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    Who is this booking for?
                  </h2>

                  <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                    <BookingForPicker
                      value={bookingFor}
                      onChange={setBookingFor}
                    />
                  </div>
                </div>
              </SectionShell>

              {/* Schedule */}
              <SectionShell className="lab-corner p-6 sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">03 · Collection</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Pick a collection slot
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        At-home collection is scheduled for the selected
                        date and time window.
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays size={17} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Field label="Collection date">
                      <input
                        className="input h-12"
                        type="date"
                        required
                        min={tomorrow()}
                        value={scheduledDate}
                        onChange={(e) =>
                          setScheduledDate(e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <p className="label">Collection window</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {TIME_SLOTS.map((slot) => (
                        <ScheduleCard
                          key={slot}
                          value={slot}
                          selected={timeSlot === slot}
                          onClick={() => setTimeSlot(slot)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionShell>

              {/* Address */}
              <SectionShell className="lab-corner p-6 sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">04 · Collection address</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Where should the sample be collected?
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin size={17} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Field label="Address line 1" className="sm:col-span-2">
                      <input
                        className="input h-12"
                        placeholder="House / apartment, street"
                        autoComplete="street-address"
                        required
                        value={address.line1}
                        onChange={(e) =>
                          updateAddress("line1", e.target.value)
                        }
                      />
                    </Field>

                    <Field
                      label="Address line 2"
                      className="sm:col-span-2"
                    >
                      <input
                        className="input h-12"
                        placeholder="Area, landmark (optional)"
                        autoComplete="address-line2"
                        value={address.line2}
                        onChange={(e) =>
                          updateAddress("line2", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="City">
                      <input
                        className="input h-12"
                        placeholder="City"
                        autoComplete="address-level2"
                        required
                        value={address.city}
                        onChange={(e) =>
                          updateAddress("city", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="State">
                      <input
                        className="input h-12"
                        placeholder="State"
                        autoComplete="address-level1"
                        required
                        value={address.state}
                        onChange={(e) =>
                          updateAddress("state", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="Pincode">
                      <input
                        className="input h-12"
                        placeholder="160001"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                        value={address.pincode}
                        onChange={(e) =>
                          updateAddress(
                            "pincode",
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                      />
                    </Field>

                    <Field label="Contact phone">
                      <input
                        className="input h-12"
                        placeholder="+91 98765 43210"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={address.phone}
                        onChange={(e) =>
                          updateAddress("phone", e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.035] px-3.5 py-3 text-[10px] leading-5 text-slate-500">
                    <Home size={13} className="shrink-0 text-primary" />
                    Please ensure someone is available during the selected
                    collection window.
                  </div>
                </div>
              </SectionShell>

              {/* Payment */}
              <SectionShell className="lab-corner p-6 sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">05 · Payment</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Choose how to pay
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CreditCard size={17} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <PaymentOption
                      selected={paymentMethod === "cod"}
                      onClick={() => setPaymentMethod("cod")}
                      icon={<Banknote size={19} />}
                      title="Pay at home"
                      description="Pay when your sample collection is completed."
                    />

                    <PaymentOption
                      selected={paymentMethod === "online"}
                      onClick={() => setPaymentMethod("online")}
                      icon={<CreditCard size={19} />}
                      title="Pay online"
                      description="Complete payment through the secure gateway."
                    />
                  </div>

                  {paymentMethod === "online" && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-[10px] leading-5 text-emerald-700">
                      <ShieldCheck size={13} />
                      A secure Razorpay payment window will open after you
                      confirm the booking.
                    </div>
                  )}
                </div>
              </SectionShell>
            </div>

            {/* Right summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_25px_75px_rgba(15,23,42,.09)] backdrop-blur-2xl">
                <div className="promo-shine relative overflow-hidden bg-gradient-to-br from-[#0F6E5B] to-[#073E35] text-white">
                  <img
                    src={LAB_PROMO_IMAGE}
                    alt="Laboratory diagnostics"
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#073E35]/95 via-[#0F6E5B]/85 to-transparent" />

                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <FlaskConical size={17} />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/55">
                        Diagnostic checkout
                      </span>
                    </div>

                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200/55">
                      Total payable
                    </p>

                    <p className="mt-1 font-mono text-3xl font-semibold">
                      ₹{total}
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      {tests.length}{" "}
                      {tests.length === 1 ? "test" : "tests"} selected
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-2">
                    <SummaryStat
                      icon={<CalendarDays size={14} />}
                      label="Date"
                      value={new Date(
                        `${scheduledDate}T00:00:00`
                      ).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    />

                    <SummaryStat
                      icon={<Clock3 size={14} />}
                      label="Window"
                      value={timeSlot.split(" - ")[0]}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/55 p-4">
                    <div className="flex items-center gap-2">
                      <PackageCheck
                        size={15}
                        className="text-primary"
                      />
                      <p className="text-xs font-semibold text-slate-800">
                        Collection summary
                      </p>
                    </div>

                    <div className="mt-3 space-y-2 text-[10px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">
                          Patient
                        </span>
                        <span className="text-right font-semibold text-slate-700">
                          {bookingFor.type === "self"
                            ? "You"
                            : bookingFor.dependentName ||
                              "Family member"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">
                          Collection
                        </span>
                        <span className="text-right font-semibold text-slate-700">
                          At home
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">
                          Payment
                        </span>
                        <span className="text-right font-semibold capitalize text-slate-700">
                          {paymentMethod === "cod"
                            ? "Pay at home"
                            : "Online"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Tests subtotal
                      </span>
                      <span className="font-medium text-slate-800">
                        ₹{total}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Collection
                      </span>
                      <span className="font-medium text-slate-800">
                        Included
                      </span>
                    </div>

                    <div className="border-t border-slate-200/70 pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Total
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            Final booking amount
                          </p>
                        </div>

                        <span className="font-mono text-xl font-semibold text-slate-950">
                          ₹{total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-xs leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={placing}
                    className="submit-button mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {placing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Confirm booking
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <LockKeyhole size={12} className="text-primary/70" />
                    Secure diagnostic booking
                  </div>

                  <a
                    href={LAB_PROMO_VIDEO_PAGE}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-primary"
                  >
                    <Sparkles size={12} />
                    Explore laboratory media
                    <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </form>

        <section className="mt-7 rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_25px_75px_rgba(15,23,42,.14)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[.15em]">
                  Connected diagnostics
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                From collection to report, keep everything connected.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Once your booking is complete, track the collection status and
                access the final report from your lab booking page.
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

function SummaryStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="text-primary">{icon}</span>
        <p className="text-[9px] font-bold uppercase tracking-[.12em]">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-xs font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
