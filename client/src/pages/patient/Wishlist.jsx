import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  HeartOff,
  LockKeyhole,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useCart } from "../../context/CartContext.jsx";

const WISHLIST_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=85";

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80";

function WishlistCard({ med, onRemove, onAdd, adding }) {
  const hasDiscount = med.mrp > med.sellingPrice;

  return (
    <article className="wishlist-card group">
      <span className="wishlist-card-corner wishlist-card-corner-top" />
      <span className="wishlist-card-corner wishlist-card-corner-bottom" />
      <span className="wishlist-card-shine" />

      <div className="relative z-10">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-100">
          <div className="aspect-[1.18/1]">
            <img
              src={med.imageUrl || med.image || FALLBACK_IMAGE}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

          <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/85 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-primary shadow-sm backdrop-blur-md">
            {med.category || "Health"}
          </span>

          <button
            type="button"
            onClick={() => onRemove(med._id)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/85 text-slate-400 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${med.name} from wishlist`}
          >
            <X size={15} />
          </button>

          {hasDiscount && (
            <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-white shadow-sm">
              Save ₹{med.mrp - med.sellingPrice}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[.14em] text-slate-300">
              Saved item
            </span>

            {med.ratingCount > 0 && (
              <span className="text-[10px] font-semibold text-amber-600">
                ★ {Number(med.ratingAverage || 0).toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="mt-2 min-h-[2.6rem] text-sm font-semibold leading-5 text-slate-900 transition group-hover:text-primary">
            {med.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[10px] leading-5 text-slate-400">
            {med.description || `${med.unit || "Health essential"} from the KapHealth store.`}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                ₹{med.sellingPrice}
              </p>
              {hasDiscount && (
                <p className="font-mono text-[10px] text-slate-400 line-through">
                  ₹{med.mrp}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={med.requiresPrescription || adding}
              onClick={() => onAdd(med)}
              className={[
                "relative overflow-hidden rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] transition-all duration-300",
                med.requiresPrescription || adding
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-primary text-white shadow-lg shadow-primary/10 hover:-translate-y-0.5 hover:shadow-xl",
              ].join(" ")}
            >
              {!med.requiresPrescription && !adding && (
                <span className="wishlist-button-shine" />
              )}

              <span className="relative z-10 inline-flex items-center gap-1.5">
                <ShoppingCart size={13} />
                {adding
                  ? "Adding..."
                  : med.requiresPrescription
                    ? "Rx only"
                    : "Add"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniPerk({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.3rem] border border-slate-200/75 bg-white/60 p-4 transition hover:bg-white hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { refreshCart } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    api
      .get("/store/wishlist")
      .then(({ data }) => {
        setMedicines(data.medicines || []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Couldn't load your wishlist."
        );
        setMedicines([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function remove(id) {
    try {
      await api.delete(`/store/wishlist/${id}`);
      setMedicines((current) =>
        current.filter((medicine) => medicine._id !== id)
      );
      showToast("Removed from wishlist");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Couldn't remove this item"
      );
    }
  }

  async function addToCart(medicine) {
    if (medicine.requiresPrescription) {
      showToast("This item needs a prescription");
      return;
    }

    setAddingId(medicine._id);

    try {
      await api.post("/store/cart/items", {
        medicineId: medicine._id,
        quantity: 1,
      });

      await refreshCart();
      showToast(`Added ${medicine.name} to cart`);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Couldn't add this item to cart"
      );
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="wishlist-page relative min-h-screen overflow-hidden bg-[#f4f9f6] pb-10">
      <Navbar />

      <style>{`
        .wishlist-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 93% 22%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .wishlist-page::before {
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

        .wishlist-card {
          position: relative;
          overflow: hidden;
          border-radius: 1.8rem;
          border: 1px solid rgba(255,255,255,.82);
          background: rgba(255,255,255,.70);
          padding: 16px;
          box-shadow: 0 18px 55px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease,
            background .4s ease;
        }

        .wishlist-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,.88);
          box-shadow: 0 30px 75px rgba(15,110,91,.11);
        }

        .wishlist-card-corner {
          position: absolute;
          width: 20%;
          height: 20%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .wishlist-card-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.8rem 0 100%;
        }

        .wishlist-card-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.8rem;
          background: rgba(15,110,91,.025);
        }

        .wishlist-card:hover .wishlist-card-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.8rem;
        }

        .wishlist-card-shine {
          position: absolute;
          top: -35%;
          left: -35%;
          width: 15%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transition: left .8s ease;
          pointer-events: none;
        }

        .wishlist-card:hover .wishlist-card-shine {
          left: 135%;
        }

        .wishlist-button-shine {
          position: absolute;
          top: -45%;
          left: -35%;
          width: 22%;
          height: 190%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
          transition: left .7s ease;
          pointer-events: none;
        }

        button:hover .wishlist-button-shine {
          left: 120%;
        }

        .wishlist-promo {
          position: relative;
          overflow: hidden;
        }

        .wishlist-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
          animation: wishlist-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes wishlist-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wishlist-card,
          .wishlist-card-corner,
          .wishlist-card-shine,
          .wishlist-button-shine,
          .wishlist-promo::after {
            transition: none !important;
            animation: none !important;
          }

          .wishlist-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/65 px-3 py-1.5 text-[9px] font-semibold text-slate-600 shadow-sm backdrop-blur-md">
                  <Heart size={13} className="text-accent" />
                  Saved for later
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <BadgeCheck size={11} />
                  Personal collection
                </span>
              </div>

              <p className="eyebrow mt-6">Your wishlist</p>

              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl">
                Keep the things you
                <span className="block text-primary">
                  want close.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Save everyday health essentials for later, compare your
                options, and move the products you need into your cart in one
                step.
              </p>
            </div>

            <div className="grid min-w-[230px] grid-cols-2 gap-2">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Saved
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-slate-900">
                  {loading ? "—" : medicines.length}
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  products
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Pharmacy
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Ready
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  to shop
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advertising banner */}
        <section className="wishlist-promo group relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
          <div className="absolute inset-0">
            <img
              src={WISHLIST_IMAGE}
              alt="KapHealth pharmacy"
              className="h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/10" />
          </div>

          <div className="relative z-10 flex min-h-[225px] items-center p-7 sm:p-9">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                <Sparkles size={11} />
                KapHealth Pharmacy
              </span>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Saved today. Delivered when you’re ready.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Your saved products stay within the KapHealth store so you can
                come back, review them, and continue shopping without starting
                over.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] text-white/55">
                  <Truck size={11} />
                  Home delivery
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] text-white/55">
                  <ShieldCheck size={11} />
                  Secure checkout
                </span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
            {error}
          </div>
        )}

        {/* Saved products */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your collection</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Saved health essentials
              </h2>
            </div>

            <Link
              to="/patient/store"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/65 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.1em] text-slate-500 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
            >
              Continue shopping
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-[425px] animate-pulse rounded-[1.8rem] border border-slate-200 bg-white/55"
                />
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/55 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HeartOff size={26} />
              </div>

              <p className="eyebrow mt-5">Nothing saved yet</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Your wishlist is waiting for its first item.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Browse the pharmacy and save products you want to revisit
                later.
              </p>

              <Link
                to="/patient/store"
                className="btn-primary mt-5 inline-flex"
              >
                Browse the store
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {medicines.map((medicine) => (
                <WishlistCard
                  key={medicine._id}
                  med={medicine}
                  adding={addingId === medicine._id}
                  onRemove={remove}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bottom benefit section */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <MiniPerk
            icon={ShoppingCart}
            title="One-step shopping"
            text="Move saved products into your cart without hunting for them again."
          />

          <MiniPerk
            icon={ShieldCheck}
            title="Prescription-aware"
            text="Prescription-only products remain clearly marked and protected."
          />

          <MiniPerk
            icon={Package}
            title="Connected pharmacy"
            text="Your wishlist lives alongside the rest of your KapHealth store journey."
          />
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · saved pharmacy items
          <Sparkles size={11} className="text-primary/45" />
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl">
          <BadgeCheck size={14} className="text-emerald-300" />
          {toast}
        </div>
      )}
    </div>
  );
}
