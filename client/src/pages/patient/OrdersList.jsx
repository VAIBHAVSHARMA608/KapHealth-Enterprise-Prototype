import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  HeartPulse,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = {
  placed: "pending",
  confirmed: "success",
  packed: "success",
  shipped: "processing",
  out_for_delivery: "processing",
  delivered: "success",
  cancelled: "danger",
  returned: "gray",
};

const LABEL = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const PHARMACY_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=85";

function OrderCard({ order, index }) {
  const isActive = [
    "placed",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
  ].includes(order.status);

  const isDelivered = order.status === "delivered";
  const isCancelled = ["cancelled", "returned"].includes(order.status);

  return (
    <Link
      to={`/patient/orders/${order._id}`}
      className="order-card group relative block overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/70 p-5 shadow-[0_18px_52px_rgba(15,23,42,.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(15,110,91,.11)] sm:p-6"
    >
      <span className="order-corner order-corner-top" />
      <span className="order-corner order-corner-bottom" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-[1.25rem] bg-primary/10 blur-lg transition duration-500 group-hover:scale-110" />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] border-4 border-white bg-gradient-to-br from-primary to-emerald-800 text-white shadow-md transition duration-500 group-hover:rotate-[-3deg] group-hover:scale-105">
              <Package size={23} strokeWidth={1.7} />
            </div>

            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
              {isDelivered ? (
                <BadgeCheck size={11} />
              ) : (
                <Truck size={11} />
              )}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm font-bold tracking-tight text-slate-900 transition group-hover:text-primary">
                {order.orderNumber}
              </p>

              {isActive && (
                <span className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-primary">
                  Tracking active
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} className="text-primary/70" />
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock3 size={12} className="text-primary/70" />
                {new Date(order.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="flex items-center gap-1.5">
                <ShoppingBag size={12} className="text-primary/70" />
                Pharmacy order
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="flex items-center gap-3">
            <StatusBadge tone={TONE[order.status]}>
              {LABEL[order.status] || order.status.replace(/_/g, " ")}
            </StatusBadge>

            <span className="font-mono text-sm font-bold text-slate-900">
              ₹{order.total}
            </span>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          {isActive ? (
            <>
              <Truck size={12} className="text-primary" />
              Medicine delivery in progress
            </>
          ) : isDelivered ? (
            <>
              <BadgeCheck size={12} className="text-emerald-600" />
              Delivered successfully
            </>
          ) : isCancelled ? (
            <>
              <FileText size={12} />
              Order closed
            </>
          ) : (
            <>
              <ShieldCheck size={12} />
              Pharmacy order record
            </>
          )}
        </span>

        <span className="text-[9px] font-bold uppercase tracking-[.11em] text-slate-300 transition group-hover:text-primary">
          View order
        </span>
      </div>

      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />

      <span className="absolute right-5 top-5 text-[9px] font-bold text-slate-200">
        {String(index + 1).padStart(2, "0")}
      </span>
    </Link>
  );
}

function PromoBanner() {
  return (
    <section className="orders-promo group relative mt-7 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_26px_80px_rgba(15,23,42,.14)]">
      <div className="absolute inset-0">
        <img
          src={PHARMACY_PROMO_IMAGE}
          alt="Pharmacy medicines"
          className="h-full w-full object-cover opacity-40 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
      </div>

      <div className="relative z-10 flex min-h-[245px] items-center p-7 sm:p-9">
        <div className="max-w-2xl text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
              KapHealth Pharmacy
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/50">
              Connected delivery
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            From prescription to doorstep.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
            Keep every medicine order visible, track delivery progress, and
            open the order record whenever you need it.
          </p>

          <Link
            to="/patient/store"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Browse pharmacy
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden w-60 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20 shadow-2xl backdrop-blur-md lg:block">
        <div className="aspect-video overflow-hidden">
          <img
            src={PHARMACY_PROMO_IMAGE}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center gap-2 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <HeartPulse size={15} />
          </div>

          <div>
            <p className="text-[10px] font-semibold text-white">
              Care, all connected
            </p>
            <p className="mt-0.5 text-[9px] text-white/40">
              Prescription to delivery
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setLoading(true);

      try {
        const { data } = await api.get("/orders");

        if (!mounted) return;

        setOrders(data.orders || []);
        setError("");
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load your medicine orders."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" &&
          [
            "placed",
            "confirmed",
            "packed",
            "shipped",
            "out_for_delivery",
          ].includes(order.status)) ||
        (filter === "delivered" && order.status === "delivered") ||
        (filter === "closed" &&
          ["cancelled", "returned"].includes(order.status));

      const searchable = [
        order.orderNumber,
        order.status,
        ...(order.items || []).map((item) => item.medicine?.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        (!normalizedSearch || searchable.includes(normalizedSearch))
      );
    });
  }, [orders, filter, search]);

  const activeCount = orders.filter((order) =>
    ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(
      order.status
    )
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const totalSpent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <div className="orders-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .orders-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 29rem),
            radial-gradient(circle at 92% 28%, rgba(16,185,129,.055), transparent 27rem),
            #f4f9f6;
        }

        .orders-page::before {
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

        .order-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .order-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.8rem 0 100%;
        }

        .order-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.8rem;
          background: rgba(15,110,91,.03);
        }

        .order-card:hover .order-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.8rem;
        }

        .orders-promo::after {
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
          animation: orders-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .orders-search {
          position: relative;
        }

        .orders-search::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          transform: translateX(-50%);
          border-radius: 99px;
          background: #0f6e5b;
          transition: width .3s ease;
        }

        .orders-search:focus-within::after {
          width: calc(100% - 1.5rem);
        }

        @keyframes orders-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-corner,
          .orders-promo::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_22px_70px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-primary" />
                  Pharmacy hub
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <ShieldCheck size={11} />
                  Secure orders
                </span>
              </div>

              <p className="eyebrow mt-6">My orders</p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                Your medicines,
                <span className="block text-primary">
                  always within reach.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Track prescription medicines from order placement to doorstep,
                or reopen a completed order to review its details.
              </p>

              <div className="orders-search mt-7 max-w-2xl rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,.05)]">
                <div className="flex items-center">
                  <Search size={17} className="ml-3 shrink-0 text-primary/60" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search order number, medicine or status..."
                    className="h-12 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-[275px]">
              <MetricCard
                icon={<Truck size={16} />}
                label="Active"
                value={activeCount}
              />
              <MetricCard
                icon={<BadgeCheck size={16} />}
                label="Delivered"
                value={deliveredCount}
              />
              <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <HeartPulse size={15} className="text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-[.12em]">
                    Order value
                  </span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold text-slate-900">
                  ₹{totalSpent}
                </p>
              </div>
            </div>
          </div>
        </section>

        <PromoBanner />

        {/* Filters + orders */}
        <section className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Your delivery timeline</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Browse orders
              </h2>
            </div>

            <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-white/80 bg-white/60 p-1 shadow-sm backdrop-blur-xl">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["delivered", "Delivered"],
                ["closed", "Closed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={[
                    "shrink-0 rounded-full px-3.5 py-2 text-[10px] font-semibold transition-all duration-300",
                    filter === value
                      ? "bg-primary text-white shadow-md shadow-primary/15"
                      : "text-slate-500 hover:bg-white hover:text-primary",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[175px] animate-pulse rounded-[1.8rem] border border-slate-200 bg-white/60"
                />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="mt-4 space-y-3">
              {filteredOrders.map((order, index) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[2rem] border border-dashed border-slate-300 bg-white/55 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag size={28} />
              </div>

              <p className="eyebrow mt-5">Nothing here yet</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                No matching orders found.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try another medicine, order number, or status."
                  : "Once you place a medicine order, its delivery journey will appear here."}
              </p>

              <Link
                to="/patient/store"
                className="btn-primary mt-5 inline-flex"
              >
                Browse pharmacy
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>

        {/* Footer promo */}
        <section className="mt-7 rounded-[2rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Keep your care journey connected.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                Your pharmacy orders sit alongside consultations,
                prescriptions, diagnostics, and wellness tools.
              </p>
            </div>

            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary transition hover:gap-2.5"
            >
              View appointments
              <ChevronRight size={13} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-primary">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
