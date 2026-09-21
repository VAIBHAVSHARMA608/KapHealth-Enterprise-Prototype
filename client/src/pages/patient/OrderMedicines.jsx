import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  FileText,
  HeartPulse,
  IndianRupee,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const PHARMACY_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=85";

const WELLNESS_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function MedicineCard({ medicine, quantity, onSetQty }) {
  const selected = quantity > 0;

  return (
    <article
      className={[
        "medicine-card group relative overflow-hidden rounded-[1.65rem] border p-4",
        "transition-all duration-500",
        selected
          ? "border-primary/25 bg-white/85 shadow-[0_16px_45px_rgba(15,110,91,.09)]"
          : "border-white/80 bg-white/60 shadow-[0_10px_34px_rgba(15,23,42,.04)]",
        "hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_55px_rgba(15,110,91,.10)]",
      ].join(" ")}
    >
      <span className="medicine-corner medicine-corner-top" />
      <span className="medicine-corner medicine-corner-bottom" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="medicine-image relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
          <img
            src={
              medicine.imageUrl ||
              medicine.image ||
              PHARMACY_PROMO_IMAGE
            }
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            onError={(event) => {
              event.currentTarget.src = PHARMACY_PROMO_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
          {selected && (
            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm">
              <Check size={11} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-primary">
                Pharmacy
              </span>

              <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-primary">
                {medicine.name}
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                ₹{medicine.sellingPrice} / {medicine.unit}
              </p>
            </div>

            {quantity > 0 && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-emerald-700">
                In order
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[.12em] text-slate-300">
                Quantity
              </p>
              <p className="mt-0.5 font-mono text-base font-bold text-slate-900">
                ₹{Number(medicine.sellingPrice || 0) * quantity}
              </p>
            </div>

            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => onSetQty(medicine._id, quantity - 1)}
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                disabled={quantity === 0}
                aria-label={`Decrease ${medicine.name} quantity`}
              >
                <Minus size={14} />
              </button>

              <span className="flex h-9 min-w-[38px] items-center justify-center border-x border-slate-100 bg-slate-50/80 font-mono text-xs font-semibold text-slate-800">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => onSetQty(medicine._id, quantity + 1)}
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                aria-label={`Increase ${medicine.name} quantity`}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <BadgeCheck size={12} className="text-primary" />
          Prescription matched
        </span>

        {selected ? (
          <button
            type="button"
            onClick={() => onSetQty(medicine._id, 0)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
          >
            <Trash2 size={12} />
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSetQty(medicine._id, 1)}
            className="medicine-add inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-white opacity-90 transition hover:-translate-y-0.5 hover:opacity-100"
          >
            Add to order
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </article>
  );
}

function PaymentCard({ active, icon, title, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-[1.5rem] border p-4 text-left transition-all duration-300",
        active
          ? "border-primary/25 bg-primary/[0.04] shadow-[0_14px_34px_rgba(15,110,91,.08)]"
          : "border-slate-200/80 bg-white/60 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "absolute -right-8 -top-8 h-16 w-16 rounded-full transition-transform duration-500",
          active
            ? "scale-[3.2] bg-primary/[0.06]"
            : "scale-0 bg-primary/[0.05] group-hover:scale-[3]",
        ].join(" ")}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
            active
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-slate-400">{body}</p>
        </div>

        <span
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full border",
            active
              ? "border-primary bg-primary"
              : "border-slate-300 bg-white",
          ].join(" ")}
        >
          {active && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </div>
    </button>
  );
}

export default function OrderMedicines() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rx, setRx] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [selections, setSelections] = useState({});
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [rxResponse, catalogResponse] = await Promise.all([
          api.get(`/prescriptions/${prescriptionId}`),
          api.get("/orders/medicines"),
        ]);

        if (!mounted) return;

        setRx(rxResponse.data.prescription);
        setCatalog(catalogResponse.data.medicines || []);
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load the prescription or pharmacy catalog."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [prescriptionId]);

  useEffect(() => {
    if (!rx || catalog.length === 0) return;

    const preset = {};

    rx.medicines.forEach((medicine) => {
      const firstWord = medicine.name
        .toLowerCase()
        .split(" ")[0];

      const match = catalog.find((item) =>
        item.name.toLowerCase().includes(firstWord)
      );

      if (match) {
        preset[match._id] = 1;
      }
    });

    setSelections(preset);
  }, [rx, catalog]);

  function setQty(medicineId, quantity) {
    setSelections((current) => ({
      ...current,
      [medicineId]: Math.max(0, Number(quantity) || 0),
    }));
  }

  const items = useMemo(
    () =>
      Object.entries(selections).filter(
        ([, quantity]) => quantity > 0
      ),
    [selections]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, [medicineId, quantity]) => {
        const medicine = catalog.find(
          (item) => item._id === medicineId
        );

        return (
          sum +
          (medicine
            ? Number(medicine.sellingPrice || 0) * quantity
            : 0)
        );
      }, 0),
    [items, catalog]
  );

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  const selectedCount = items.reduce(
    (sum, [, quantity]) => sum + quantity,
    0
  );

  const freeDeliveryRemaining = Math.max(0, 499 - subtotal);

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Add at least one medicine to continue.");
      return;
    }

    setPlacing(true);

    try {
      const { data } = await api.post("/orders", {
        prescriptionId,
        items: items.map(([medicineId, quantity]) => ({
          medicineId,
          quantity,
        })),
        deliveryAddress: address,
        paymentMethod,
      });

      if (paymentMethod === "cod") {
        navigate(`/patient/orders/${data.order._id}`);
        return;
      }

      if (data.devMode) {
        navigate(`/patient/orders/${data.order._id}`);
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
        name: "KapHealth Pharmacy",
        description: "Prescription medicine order",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            navigate(`/patient/orders/${data.order._id}`);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please check your order."
            );
            setPlacing(false);
          }
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
          "Couldn't place the order."
      );
      setPlacing(false);
    }
  }

  if (loading || !rx) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="mx-auto max-w-md rounded-[2rem] border border-white/80 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag size={24} className="animate-pulse" />
            </div>
            <p className="eyebrow mt-5">
              {error ? "Pharmacy unavailable" : "Prescription order"}
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              {error ? "Couldn't load your order" : "Preparing your pharmacy"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "Loading your prescription and matching available medicines."}
            </p>
            {error && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary mt-6"
              >
                <ArrowLeft size={15} />
                Go back
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pharmacy-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .pharmacy-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 29rem),
            radial-gradient(circle at 92% 27%, rgba(16,185,129,.05), transparent 27rem),
            #f4f9f6;
        }

        .pharmacy-page::before {
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

        .medicine-corner {
          position: absolute;
          width: 17%;
          height: 17%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .medicine-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.65rem 0 100%;
        }

        .medicine-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.65rem;
          background: rgba(15,110,91,.03);
        }

        .medicine-card:hover .medicine-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.65rem;
        }

        .promo-card::after {
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
          animation: pharmacy-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .checkout-cta {
          position: relative;
          isolation: isolate;
        }

        .checkout-cta::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #0f6e5b,
            #2fb293,
            #8ee2ce,
            #0f6e5b
          );
          background-size: 300% 300%;
          animation: pharmacy-gradient 7s ease infinite;
          filter: blur(5px);
          opacity: .6;
        }

        .order-summary {
          position: relative;
          overflow: hidden;
        }

        .order-summary::before {
          content: "";
          position: absolute;
          top: -75px;
          right: -75px;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: rgba(15,110,91,.06);
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }

        .order-summary:hover::before {
          transform: scale(2.1);
        }

        @keyframes pharmacy-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @keyframes pharmacy-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .medicine-corner,
          .promo-card::after,
          .checkout-cta::before,
          .order-summary::before {
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to prescription
          </button>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" />
                  E-prescription order
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <ShieldCheck size={11} />
                  Verified pharmacy
                </span>
              </div>

              <p className="eyebrow mt-6">Order medicines</p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                Your prescription,
                <span className="block text-primary">
                  ready for delivery.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Review the matched medicines, choose quantities, add your
                delivery address, and complete your order securely.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl">
              <LockKeyhole size={13} className="text-primary" />
              Secure pharmacy checkout
            </div>
          </div>
        </div>

        {/* Promo */}
        <section className="promo-card group relative mt-5 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_26px_80px_rgba(15,23,42,.14)]">
          <div className="absolute inset-0">
            <img
              src={PHARMACY_PROMO_IMAGE}
              alt="Pharmacy and prescription medicine"
              className="h-full w-full object-cover opacity-40 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/15" />
          </div>

          <div className="relative z-10 flex min-h-[220px] items-center p-7 sm:p-9">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                <Sparkles size={11} />
                KapHealth Pharmacy
              </span>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Medicines matched to your e-prescription.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Review every item before placing the order. Your prescription
                remains connected to the pharmacy order for a smoother care
                journey.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck size={12} className="text-emerald-300" />
                  Prescription matched
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck size={12} className="text-emerald-300" />
                  Home delivery
                </span>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={placeOrder} className="mt-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              {/* Medicines */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_20px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow">01 · Medicines</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Review prescription items
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Tap quantity controls to adjust your order.
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
                      {selectedCount}{" "}
                      {selectedCount === 1 ? "unit" : "units"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {catalog.map((medicine) => (
                      <MedicineCard
                        key={medicine._id}
                        medicine={medicine}
                        quantity={selections[medicine._id] || 0}
                        onSetQty={setQty}
                      />
                    ))}
                  </div>

                  {catalog.length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/55 p-8 text-center">
                      <ShoppingBag
                        size={28}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No matching medicines available
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Please review the prescription or contact support.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Address */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_20px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">02 · Delivery</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Delivery address
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
                          setAddress({
                            ...address,
                            line1: e.target.value,
                          })
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
                          setAddress({
                            ...address,
                            line2: e.target.value,
                          })
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
                          setAddress({
                            ...address,
                            city: e.target.value,
                          })
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
                          setAddress({
                            ...address,
                            state: e.target.value,
                          })
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
                          setAddress({
                            ...address,
                            pincode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                      />
                    </Field>

                    <Field label="Phone">
                      <input
                        className="input h-12"
                        placeholder="+91 98765 43210"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={address.phone}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            phone: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_20px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">03 · Payment</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Choose payment method
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CreditCard size={17} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <PaymentCard
                      active={paymentMethod === "cod"}
                      onClick={() => setPaymentMethod("cod")}
                      icon={<Banknote size={18} />}
                      title="Cash on delivery"
                      body="Pay when your medicine order arrives."
                    />

                    <PaymentCard
                      active={paymentMethod === "online"}
                      onClick={() => setPaymentMethod("online")}
                      icon={<CreditCard size={18} />}
                      title="Pay online"
                      body="Use secure Razorpay checkout."
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                    <LockKeyhole size={12} className="text-primary/70" />
                    Your payment is handled securely.
                  </div>
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="order-summary rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_25px_75px_rgba(15,23,42,.09)] backdrop-blur-2xl sm:p-7">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Order summary</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Ready to deliver
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/15">
                      <ShoppingBag size={17} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Items</span>
                      <span className="font-semibold text-slate-800">
                        {items.length}
                      </span>
                    </div>

                    <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
                      {items.map(([medicineId, quantity]) => {
                        const medicine = catalog.find(
                          (item) => item._id === medicineId
                        );

                        if (!medicine) return null;

                        return (
                          <div
                            key={medicineId}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="min-w-0 truncate text-slate-500">
                              {medicine.name} × {quantity}
                            </span>
                            <span className="shrink-0 font-mono font-medium text-slate-800">
                              ₹
                              {Number(medicine.sellingPrice || 0) *
                                quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {freeDeliveryRemaining > 0 && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="flex items-start gap-2.5">
                        <Truck
                          size={15}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        <div>
                          <p className="text-xs font-semibold text-emerald-800">
                            Add ₹{freeDeliveryRemaining} more for free
                            delivery
                          </p>
                          <p className="mt-1 text-[9px] leading-4 text-emerald-700/60">
                            Free delivery applies automatically at ₹499.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-800">
                        ₹{subtotal}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-medium text-slate-800">
                        {deliveryFee === 0
                          ? "Free"
                          : `₹${deliveryFee}`}
                      </span>
                    </div>

                    <div className="border-t border-slate-200/70 pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Total
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            Final payable amount
                          </p>
                        </div>

                        <span className="font-mono text-2xl font-bold text-slate-950">
                          ₹{total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-xs leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={placing || items.length === 0}
                    className="checkout-cta mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {placing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        <Truck size={16} />
                        Place order · ₹{total}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck size={12} className="text-primary/70" />
                    Prescription-linked pharmacy order
                  </div>
                </div>
              </div>

              {/* Small ad */}
              <div className="mt-4 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/65 shadow-sm backdrop-blur-xl">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={WELLNESS_PROMO_IMAGE}
                    alt="Healthy food and wellness"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-[8px] font-bold uppercase tracking-[.13em] text-emerald-200">
                      Complete your care
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      Explore wellness tools
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[10px] leading-5 text-slate-400">
                    Pair your prescription journey with diet and wellness
                    tracking inside KapHealth.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/patient/wellness/diet-planner")
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary transition hover:gap-2.5"
                  >
                    Explore wellness
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>

        <section className="mt-7 rounded-[2rem] bg-gradient-to-br from-primary to-emerald-800 p-6 text-white shadow-[0_25px_75px_rgba(15,110,91,.17)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-200">
                <HeartPulse size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[.15em]">
                  Connected care
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Your prescription is only one part of the journey.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Keep medicine orders, appointments, diagnostics, and wellness
                tools connected in your KapHealth account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/patient/doctors")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Find a doctor
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
