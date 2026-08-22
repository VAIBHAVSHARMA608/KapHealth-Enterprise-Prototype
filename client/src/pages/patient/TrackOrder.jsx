import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2, Circle, Star, Phone, MessageCircle, ShieldCheck,
  Navigation, Bike, MapPin, Building2, Package, Lock, Info,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const STAGES = [
  { key: "rx_verified", label: "Rx Verified" },
  { key: "dispensed", label: "Dispensed" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

// Maps our real order.status values onto the 4-stage breadcrumb the design
// calls for. "packed"/"confirmed" count as dispensed; "shipped"/
// "out_for_delivery" count as in-transit.
function stageIndexFor(status) {
  if (status === "delivered") return 3;
  if (["shipped", "out_for_delivery"].includes(status)) return 2;
  if (["confirmed", "packed"].includes(status)) return 1;
  return 0;
}

/** Deterministic pseudo-progress along the route, driven by real elapsed
 * time since the order was placed -- illustrative (no live GPS integration
 * exists yet), but not random-per-render, so it feels like a real, moving
 * delivery rather than decoration. */
function useSimulatedRoute(order) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 3000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    if (!order) return { pct: 0, etaMin: 0, distanceKm: 0, speedKph: 0 };
    const stageIdx = stageIndexFor(order.status);
    if (stageIdx < 2) return { pct: 0, etaMin: null, distanceKm: 4.2, speedKph: 0 };
    if (stageIdx === 3) return { pct: 100, etaMin: 0, distanceKm: 0, speedKph: 0 };

    const startedAt = new Date(order.updatedAt || order.createdAt).getTime();
    const totalTripMs = 22 * 60 * 1000; // assume ~22 min trips for the simulation
    const elapsed = Math.min(totalTripMs, Math.max(0, now - startedAt));
    const pct = Math.min(96, Math.round((elapsed / totalTripMs) * 100));
    const distanceKm = Math.max(0.3, +(4.2 * (1 - pct / 100)).toFixed(1));
    const etaMin = Math.max(1, Math.round(((100 - pct) / 100) * 22));
    return { pct, etaMin, distanceKm, speedKph: 34 };
  }, [order, now]);
}

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);

  useEffect(() => { api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)); }, [id]);
  const route = useSimulatedRoute(order);

  async function submitReview(e) {
    e.preventDefault();
    await api.post("/reviews", { targetType: "order", targetId: order._id, rating, comment });
    setReviewed(true);
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="p-10 text-muted">Loading order...</p>
      </div>
    );
  }

  const isTerminalFail = order.status === "cancelled" || order.status === "returned";
  const stageIdx = stageIndexFor(order.status);
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {isTerminalFail ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-sm font-semibold text-accent">This order was {order.status}.</p>
          </div>
        ) : (
          <>
            {/* ---- Floating top status sheet ---- */}
            <div className="glass-panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Order {order.orderNumber}</p>
                  <h1 className="mt-1 font-display text-2xl font-medium text-ink">Tracking your delivery</h1>
                </div>
                <span className="telemetry-chip"><ShieldCheck size={13} className="text-primary-dark" /> Cold-chain verified</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STAGES.map((s, i) => (
                  <div
                    key={s.key}
                    className={`rounded-2xl border px-4 py-3 text-center transition ${
                      i < stageIdx
                        ? "border-primary/30 bg-primary-light text-primary-dark"
                        : i === stageIdx
                        ? "border-primary bg-primary/15 text-primary-dark shadow-lg shadow-primary/20"
                        : "border-white/10 bg-white/5 text-muted"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide">{i + 1}. {s.label}</p>
                    {i === stageIdx && !isDelivered && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px]">
                        <span className="status-dot bg-status-active" /> Live
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Route visual (schematic -- see note) ---- */}
            {!isDelivered && stageIdx >= 2 && (
              <div className="glass-panel relative mt-5 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Navigation size={15} className="text-primary-dark" /> Live route</p>
                  <span className="flex items-center gap-1 text-[11px] text-muted"><Info size={12} /> Schematic view -- illustrative, not a real GPS map</span>
                </div>

                <div className="relative mt-6 h-20">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000"
                    style={{ width: `${route.pct}%` }}
                  />
                  <div className="absolute left-0 top-1/2 flex -translate-y-1/2 -translate-x-1/2 flex-col items-center">
                    <Building2 size={18} className="text-muted" />
                    <span className="mt-1 text-[10px] text-muted">Pharmacy</span>
                  </div>
                  <div className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 flex-col items-center">
                    <MapPin size={18} className="text-accent" />
                    <span className="mt-1 text-[10px] text-muted">Doorstep</span>
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                    style={{ left: `${route.pct}%` }}
                  >
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40">
                      <span className="status-dot absolute inset-0 rounded-full bg-primary" />
                      <Bike size={16} className="relative text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- 3-column bottom dashboard ---- */}
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {/* ETA & velocity */}
              <div className="glass-card p-6">
                <p className="eyebrow">Arrival</p>
                {stageIdx >= 2 && !isDelivered ? (
                  <>
                    <p className="mt-2 font-display text-4xl font-semibold text-ink">{route.etaMin} <span className="text-base font-normal text-muted">min</span></p>
                    <p className="mt-1 text-xs text-muted">{route.distanceKm} km remaining · ~{route.speedKph} km/h</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${route.pct}%` }} />
                    </div>
                  </>
                ) : isDelivered ? (
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-primary-dark"><CheckCircle2 size={20} /> Delivered</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">Your order is being dispensed -- tracking begins once it's out for delivery.</p>
                )}
              </div>

              {/* Courier + comms */}
              <div className="glass-card p-6">
                <p className="eyebrow">Courier</p>
                {order.courierName ? (
                  <>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                        {order.courierName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{order.courierName}</p>
                        <p className="text-xs text-muted">{order.trackingId ? `Tracking: ${order.trackingId}` : "Courier partner"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="btn-secondary flex-1 !py-2 text-xs"><Phone size={14} /> Call</button>
                      <button className="btn-secondary flex-1 !py-2 text-xs"><MessageCircle size={14} /> Chat</button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">A courier will be assigned once your order ships.</p>
                )}
              </div>

              {/* OTP + summary */}
              <div className="glass-card p-6">
                <p className="eyebrow flex items-center gap-1.5"><Lock size={12} /> Delivery OTP</p>
                {order.deliveryOtp && !isDelivered ? (
                  <>
                    <button
                      onClick={() => setOtpVisible((v) => !v)}
                      className="mt-2 w-full rounded-2xl border border-primary/30 bg-primary/10 py-4 text-center font-mono text-3xl font-bold tracking-[0.3em] text-primary-dark transition hover:bg-primary/15"
                    >
                      {otpVisible ? order.deliveryOtp : "••••"}
                    </button>
                    <p className="mt-2 text-[11px] text-muted">Tap to reveal. Share only after physically receiving the sealed package.</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">{isDelivered ? "This order has been delivered." : "OTP will appear once dispatched."}</p>
                )}
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ink"><Package size={13} /> {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                  <p className="mt-1 truncate text-[11px] text-muted">{order.items.map((it) => it.name).join(", ")}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ---- Items & payment ---- */}
        <div className="glass-panel mt-5 p-6">
          <h2 className="mb-3 font-display text-lg font-medium text-ink">Order summary</h2>
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between border-b border-white/10 py-2 text-sm last:border-0">
              <span className="text-ink/80">{it.name} × {it.quantity}</span>
              <span className="text-ink/80">₹{it.unitPrice * it.quantity}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-ink"><span>Total</span><span>₹{order.total}</span></div>
          <p className="mt-2 text-xs text-muted">Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"} · {order.paymentStatus}</p>
        </div>

        {isDelivered && !reviewed && !order.review && (
          <form onSubmit={submitReview} className="glass-panel mt-5 p-6">
            <h2 className="font-display text-lg font-medium text-ink">Rate this delivery</h2>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={22} className={n <= rating ? "fill-status-pending text-status-pending" : "text-line"} />
                </button>
              ))}
            </div>
            <textarea className="input mt-3" rows={3} placeholder="Optional feedback" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary mt-3 w-full">Submit review</button>
          </form>
        )}
        {reviewed && <p className="mt-6 text-center text-sm text-primary-dark">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
