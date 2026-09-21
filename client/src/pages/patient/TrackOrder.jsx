import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  HeartPulse,
  IndianRupee,
  LockKeyhole,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TIMELINE_STEPS = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const LABELS = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

const STATUS_COPY = {
  placed: "Your order has been received.",
  confirmed: "The pharmacy has confirmed your order.",
  packed: "Your medicines are packed and ready to move.",
  shipped: "Your package is on its way.",
  out_for_delivery: "Your medicines are arriving today.",
  delivered: "Your order has been delivered.",
};

const PHARMACY_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1500&q=85";

const DELIVERY_IMAGE =
  "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=85";

function TimelineStep({ step, index, currentIdx }) {
  const complete = index <= currentIdx;
  const current = index === currentIdx;

  return (
    <div className="relative flex gap-4">
      {index < TIMELINE_STEPS.length - 1 && (
        <span
          className={[
            "absolute left-[17px] top-9 h-[calc(100%+4px)] w-px",
            index < currentIdx ? "bg-primary" : "bg-slate-200",
          ].join(" ")}
          aria-hidden="true"
        />
      )}

      <div
        className={[
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          complete
            ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
            : "border-slate-200 bg-white text-slate-300",
          current ? "ring-4 ring-primary/10" : "",
        ].join(" ")}
      >
        {complete ? <Check size={14} /> : <Circle size={12} />}
      </div>

      <div className="pb-6">
        <p
          className={[
            "text-sm font-semibold",
            complete ? "text-slate-900" : "text-slate-400",
          ].join(" ")}
        >
          {LABELS[step]}
        </p>

        <p
          className={[
            "mt-1 text-xs",
            complete ? "text-slate-500" : "text-slate-400",
          ].join(" ")}
        >
          {STATUS_COPY[step]}
        </p>

        {current && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.06] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
              {step === "out_for_delivery" ? <Truck size={11} /> : <Clock3 size={11} />}
              {step === "out_for_delivery" ? "Delivery in progress" : "Current status"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryLine({ label, value, emphasis = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className={emphasis ? "font-semibold text-slate-800" : "text-slate-500"}>
        {label}
      </span>
      <span className={emphasis ? "font-mono font-bold text-slate-900" : "font-medium text-slate-700"}>
        {value}
      </span>
    </div>
  );
}

export default function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        const { data } = await api.get(`/orders/${id}`);

        if (mounted) {
          setOrder(data.order);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load this order."
          );
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setError("");
    setSubmittingReview(true);

    try {
      await api.post("/reviews", {
        targetType: "order",
        targetId: order._id,
        rating,
        comment,
      });

      setReviewed(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't submit your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  const currentIdx = useMemo(
    () => TIMELINE_STEPS.indexOf(order?.status),
    [order?.status]
  );

  const delivered = order?.status === "delivered";
  const cancelled = ["cancelled", "returned"].includes(order?.status);

  const itemsTotal = useMemo(
    () =>
      (order?.items || []).reduce(
        (sum, item) =>
          sum +
          Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [order]
  );

  if (!order && !error) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] border border-white/80 bg-white/65 p-8 shadow-sm backdrop-blur-xl">
            <div className="h-4 w-40 rounded-full bg-slate-200" />
            <div className="mt-4 h-10 max-w-lg rounded-xl bg-slate-200" />
            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_330px]">
              <div className="h-[520px] rounded-[1.8rem] bg-slate-100" />
              <div className="h-[420px] rounded-[1.8rem] bg-slate-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f4f9f6]">
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
          <div className="rounded-[2rem] border border-white/80 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Package size={24} />
            </div>
            <p className="eyebrow mt-5">Order unavailable</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              We couldn't open this order.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "The order record could not be found."}
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

  return (
    <div className="track-order-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .track-order-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 94% 26%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .track-order-page::before {
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

        .track-panel {
          position: relative;
          overflow: hidden;
        }

        .track-panel::before,
        .track-panel::after {
          content: "";
          position: absolute;
          width: 17%;
          height: 17%;
          pointer-events: none;
          background: rgba(15,110,91,.04);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .track-panel::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .track-panel::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
          background: rgba(15,110,91,.025);
        }

        .track-panel:hover::before,
        .track-panel:hover::after {
          width: 65%;
          height: 65%;
          border-radius: 2rem;
        }

        .rating-star {
          transition:
            transform .2s ease,
            color .2s ease;
        }

        .rating-star:hover {
          transform: translateY(-2px) scale(1.12);
        }

        .delivery-promo::after {
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
            rgba(255,255,255,.17),
            transparent
          );
          animation: track-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes track-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .track-panel::before,
          .track-panel::after,
          .rating-star,
          .delivery-promo::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to orders
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
            <LockKeyhole size={12} className="text-primary" />
            Secure order tracking
          </div>
        </div>

        {/* Header */}
        <section className="track-panel rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_25px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-primary" />
                  Pharmacy order
                </span>

                {!cancelled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                    <Truck size={11} />
                    Delivery tracking
                  </span>
                )}
              </div>

              <p className="eyebrow mt-6">
                Order {order.orderNumber}
              </p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
                {cancelled
                  ? "Your order has been closed."
                  : delivered
                    ? "Your medicines have arrived."
                    : "Your medicines are on the move."}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {cancelled
                  ? `This order was ${order.status}.`
                  : delivered
                    ? "Your delivery journey is complete. Review the order and share your experience below."
                    : "Follow the delivery journey from pharmacy confirmation to your doorstep."}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/65 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                Order value
              </p>
              <p className="mt-1 flex items-center gap-0.5 font-mono text-2xl font-bold text-slate-900">
                <IndianRupee size={17} />
                {order.total}
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Promotional delivery banner */}
        <section className="delivery-promo group relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_26px_80px_rgba(15,23,42,.13)]">
          <div className="absolute inset-0">
            <img
              src={DELIVERY_IMAGE}
              alt="Medicine delivery"
              className="h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/15" />
          </div>

          <div className="relative z-10 flex min-h-[210px] items-center p-7 sm:p-9">
            <div className="max-w-xl text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                <HeartPulse size={11} />
                Connected pharmacy care
              </span>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                From prescription to doorstep, one connected journey.
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Your order remains linked to the KapHealth care experience,
                making it easier to keep consultations, prescriptions, and
                delivery history together.
              </p>
            </div>

            <div className="absolute bottom-5 right-5 hidden w-52 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20 backdrop-blur-md lg:block">
              <img
                src={PHARMACY_IMAGE}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <div className="p-3">
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-emerald-300">
                  KapHealth Pharmacy
                </p>
                <p className="mt-1 text-[9px] text-white/40">
                  Secure medicine fulfilment
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
          {/* Main tracking */}
          <div className="space-y-5">
            <section className="track-panel rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Delivery journey</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Track your order
                    </h2>
                  </div>

                  {!cancelled && (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      Live status
                    </span>
                  )}
                </div>

                {cancelled ? (
                  <div className="mt-6 rounded-[1.6rem] border border-red-100 bg-red-50/80 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                        <Package size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          Order {order.status}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700/70">
                          This order is no longer progressing through the
                          delivery timeline.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-7">
                    {TIMELINE_STEPS.map((step, index) => (
                      <TimelineStep
                        key={step}
                        step={step}
                        index={index}
                        currentIdx={currentIdx}
                      />
                    ))}

                    {order.trackingId && (
                      <div className="mt-2 rounded-[1.4rem] border border-slate-200/75 bg-white/65 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                              Tracking ID
                            </p>
                            <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                              {order.trackingId}
                            </p>
                          </div>

                          {order.courierName && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                                Courier
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {order.courierName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Items */}
            <section className="track-panel rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
              <div className="relative z-10">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Order contents</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Medicines in this order
                    </h2>
                  </div>

                  <span className="rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-primary">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="group flex items-center justify-between gap-4 rounded-[1.3rem] border border-slate-200/70 bg-white/55 px-4 py-3.5 transition hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Package size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            ₹{item.unitPrice} each · Qty {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-mono text-xs font-semibold text-slate-700">
                        ₹{Number(item.unitPrice || 0) * Number(item.quantity || 0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-200/70 pt-4">
                  <SummaryLine
                    label="Items subtotal"
                    value={`₹${itemsTotal}`}
                  />

                  <SummaryLine
                    label="Delivery"
                    value={
                      Number(order.total || 0) > itemsTotal
                        ? `₹${Number(order.total || 0) - itemsTotal}`
                        : "Included"
                    }
                  />

                  <SummaryLine
                    label="Total"
                    value={`₹${order.total}`}
                    emphasis
                  />

                  <p className="mt-3 text-[9px] text-slate-400">
                    Payment:{" "}
                    {order.paymentMethod === "cod"
                      ? "Cash on delivery"
                      : "Paid online"}{" "}
                    · {order.paymentStatus}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Side rail */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="track-panel rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/15">
                    <Truck size={18} />
                  </div>

                  <div>
                    <p className="eyebrow">Delivery status</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {cancelled
                        ? "Closed"
                        : LABELS[order.status] || order.status}
                    </h2>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-primary/[0.045] p-4">
                  <p className="text-xs font-semibold text-slate-800">
                    {cancelled
                      ? "No further delivery updates"
                      : STATUS_COPY[order.status] ||
                        "Your order status is being tracked."}
                  </p>

                  {!cancelled && order.status !== "delivered" && (
                    <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      Tracking active
                    </div>
                  )}
                </div>

                {order.trackingId && (
                  <div className="mt-4 rounded-[1.3rem] border border-slate-200/75 bg-white/60 p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[.12em] text-slate-400">
                      Tracking reference
                    </p>
                    <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">
                      {order.trackingId}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Review */}
            {delivered && !reviewed && !order.review && (
              <form
                onSubmit={submitReview}
                className="track-panel rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_65px_rgba(15,23,42,.07)] backdrop-blur-2xl"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Delivered</p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900">
                        How was your delivery?
                      </h2>
                    </div>

                    <HeartPulse size={19} className="text-primary" />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    A quick rating helps us improve the pharmacy experience.
                  </p>

                  <div className="mt-5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((number) => {
                      const active =
                        number <= (hoverRating || rating);

                      return (
                        <button
                          type="button"
                          key={number}
                          className="rating-star p-1"
                          onMouseEnter={() => setHoverRating(number)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(number)}
                          aria-label={`Rate ${number} out of 5`}
                        >
                          <Star
                            size={26}
                            fill={active ? "currentColor" : "none"}
                            className={
                              active
                                ? "text-amber-500"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {rating} / 5 selected
                  </p>

                  <textarea
                    className="input mt-4"
                    rows={4}
                    placeholder="Optional feedback about your delivery..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  {error && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    disabled={submittingReview}
                    className="btn-primary mt-4 w-full"
                  >
                    {submittingReview ? "Submitting..." : "Submit review"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {reviewed && (
              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/80 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <CheckCircle2 size={22} />
                </div>
                <p className="mt-4 text-sm font-semibold text-emerald-900">
                  Thanks for your feedback!
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-700/70">
                  Your delivery experience has been recorded.
                </p>
              </div>
            )}

            <section className="rounded-[1.8rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Connected care
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Your medicine order stays linked with the rest of your
                    KapHealth journey.
                  </p>
                </div>
              </div>

              <Link
                to="/patient/appointments"
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary transition hover:gap-2.5"
              >
                View consultations
                <ChevronRight size={13} />
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
