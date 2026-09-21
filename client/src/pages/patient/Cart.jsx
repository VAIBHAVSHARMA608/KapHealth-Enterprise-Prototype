import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useCart } from "../../context/CartContext.jsx";

function QuantityControl({ quantity, disabled, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        disabled={disabled || quantity <= 1}
        onClick={onDecrease}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-slate-200 bg-slate-100/90 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus size={14} strokeWidth={2} />
      </button>

      <div className="flex h-10 min-w-[52px] items-center justify-center border-y border-slate-200 bg-white px-2 font-mono text-sm font-semibold text-slate-800">
        {disabled ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
        ) : (
          quantity
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-slate-200 bg-slate-100/90 text-slate-600 transition hover:bg-slate-200 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function CheckoutAction({ total, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="checkout-action group relative h-14 w-full overflow-hidden rounded-full border-0 bg-[#0b0f0e] p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <span className="checkout-label absolute inset-1 z-10 flex items-center justify-center rounded-full bg-[#0b0f0e] px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all duration-500">
        Proceed · ₹{total}
      </span>

      <span className="checkout-icons absolute inset-0 z-20 flex items-center justify-center gap-6 text-white opacity-0 transition-all duration-500">
        <ShieldCheck size={19} />
        <Truck size={19} />
        <ArrowRight size={19} />
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-50"
      />
    </button>
  );
}

export default function Cart() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCouponInput(cart?.couponCode || "");
  }, [cart?.couponCode]);

  async function updateQty(medicineId, quantity) {
    if (quantity < 1) return removeItem(medicineId);

    setBusy(true);
    setUpdatingId(medicineId);
    setError("");

    try {
      await api.patch(`/store/cart/items/${medicineId}`, { quantity });
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't update the quantity."
      );
    } finally {
      setBusy(false);
      setUpdatingId(null);
    }
  }

  async function removeItem(medicineId) {
    setBusy(true);
    setRemovingId(medicineId);
    setError("");

    try {
      await api.delete(`/store/cart/items/${medicineId}`);
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't remove this item."
      );
    } finally {
      setBusy(false);
      setRemovingId(null);
    }
  }

  async function applyCoupon(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await api.post("/store/cart/coupon", {
        code: couponInput.trim() || null,
      });
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid coupon code."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />

        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag size={24} className="animate-pulse" />
            </div>
            <p className="eyebrow mt-5">Your cart</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Preparing your cart
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              We're loading your medicine and healthcare essentials.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const hasItems = cart.items.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .qty-box {
          position: relative;
          overflow: hidden;
        }

        .qty-box::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 15%,
            rgba(255,255,255,.7) 50%,
            transparent 85%
          );
          transform: translateX(-130%);
          transition: transform .55s ease;
          pointer-events: none;
        }

        .qty-box:hover::after {
          transform: translateX(130%);
        }

        .cart-product {
          position: relative;
          overflow: hidden;
        }

        .cart-product::before,
        .cart-product::after {
          content: "";
          position: absolute;
          width: 22%;
          height: 22%;
          background: rgba(15,110,91,.09);
          transition: all .5s cubic-bezier(.22,1,.36,1);
          z-index: 0;
        }

        .cart-product::before {
          top: 0;
          right: 0;
          border-radius: 0 1rem 0 100%;
        }

        .cart-product::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1rem;
        }

        .cart-product:hover::before,
        .cart-product:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          background: rgba(15,110,91,.045);
        }

        .checkout-label {
          transition:
            transform .45s cubic-bezier(.68,-.55,.265,1.55),
            opacity .3s ease,
            width .45s ease;
        }

        .checkout-icons {
          transform: scale(.65);
        }

        .checkout-action:hover .checkout-label {
          transform: scale(.45) translateY(-55px);
          opacity: 0;
        }

        .checkout-action:hover .checkout-icons {
          transform: scale(1);
          opacity: 1;
        }

        .checkout-action:active .checkout-label {
          transform: scale(.4) translateY(-55px);
        }

        @media (prefers-reduced-motion: reduce) {
          .qty-box::after,
          .cart-product::before,
          .cart-product::after,
          .checkout-label,
          .checkout-icons {
            transition: none !important;
          }

          .checkout-action:hover .checkout-label {
            transform: none;
            opacity: 1;
          }

          .checkout-action:hover .checkout-icons {
            opacity: 0;
          }
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-16 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/patient/store"
              className="group mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
                <ArrowLeft size={14} />
              </span>
              Continue shopping
            </Link>

            <p className="eyebrow flex items-center gap-2">
              <ShoppingBag size={13} />
              Your cart
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Essentials, ready to go.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review medicines and healthcare essentials before checkout.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl">
            <ShieldCheck size={13} className="text-primary" />
            Secure checkout
          </div>
        </div>

        {!hasItems ? (
          <section className="mx-auto mt-8 max-w-2xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-12">
              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/[0.07] text-primary ring-1 ring-inset ring-primary/10">
                  <ShoppingBag size={30} strokeWidth={1.6} />
                </div>

                <p className="eyebrow mt-6">Nothing here yet</p>

                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900">
                  Your cart is empty.
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Browse medicines and healthcare essentials, then come back
                  here when you're ready to check out.
                </p>

                <Link
                  to="/patient/store"
                  className="btn-primary mt-6 inline-flex"
                >
                  Browse the store
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            {/* Items */}
            <section>
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Cart items
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {cart.items.length}{" "}
                      {cart.items.length === 1 ? "item" : "items"} in your cart
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
                    <CheckCircle2 size={13} />
                    Ready to review
                  </div>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {cart.items.map(
                    ({ medicine, quantity, lineTotal }) => {
                      const updating = updatingId === medicine._id;
                      const removing = removingId === medicine._id;

                      return (
                        <article
                          key={medicine._id}
                          className="cart-product group relative p-4 transition-colors hover:bg-white/45 sm:p-5"
                        >
                          <div className="relative z-10 flex gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-primary/[0.05] text-primary shadow-sm transition-transform duration-500 group-hover:scale-[1.03] sm:h-24 sm:w-24">
                              <Package size={25} strokeWidth={1.6} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                    {medicine.name}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    ₹{medicine.sellingPrice}{" "}
                                    <span className="text-slate-300">/</span>{" "}
                                    {medicine.unit}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => removeItem(medicine._id)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Remove ${medicine.name}`}
                                >
                                  {removing ? (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                    Quantity
                                  </p>

                                  <div className="qty-box rounded-xl shadow-sm">
                                    <QuantityControl
                                      quantity={quantity}
                                      disabled={updating}
                                      onDecrease={() =>
                                        updateQty(
                                          medicine._id,
                                          quantity - 1
                                        )
                                      }
                                      onIncrease={() =>
                                        updateQty(
                                          medicine._id,
                                          quantity + 1
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                    Line total
                                  </p>
                                  <p className="mt-1 font-mono text-base font-semibold text-slate-900">
                                    ₹{lineTotal}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoTile
                  icon={<Truck size={17} />}
                  title="Reliable delivery"
                  body="Track your order after checkout."
                />
                <InfoTile
                  icon={<ShieldCheck size={17} />}
                  title="Secure purchase"
                  body="Protected account and checkout."
                />
                <InfoTile
                  icon={<Package size={17} />}
                  title="Order visibility"
                  body="Keep delivery status in one place."
                />
              </div>
            </section>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_22px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-6 text-white">
                  <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <Tag size={17} />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
                        Order summary
                      </span>
                    </div>

                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200/55">
                      Total payable
                    </p>

                    <p className="mt-1 font-mono text-3xl font-semibold">
                      ₹{cart.total}
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      Final amount shown before checkout.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <form onSubmit={applyCoupon}>
                    <label className="label" htmlFor="coupon">
                      Have a coupon?
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="coupon"
                          className="input h-11 pl-9 pr-3 text-xs uppercase"
                          placeholder="WELCOME50"
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={busy}
                        className="btn-secondary !px-4 !py-2.5 text-xs"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  {(error || cart.couponError) && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                      {error || cart.couponError}
                    </div>
                  )}

                  {cart.couponCode && !error && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                      <CheckCircle2 size={14} />
                      Coupon {cart.couponCode} applied
                    </div>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-800">
                        ₹{cart.subtotal}
                      </span>
                    </div>

                    {cart.discount > 0 && (
                      <div className="flex items-center justify-between text-primary">
                        <span>Coupon discount</span>
                        <span className="font-medium">
                          −₹{cart.discount}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-medium text-slate-800">
                        {cart.deliveryFee === 0
                          ? "Free"
                          : `₹${cart.deliveryFee}`}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-slate-200/70 pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Total
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            Taxes and fees included where applicable
                          </p>
                        </div>

                        <span className="font-mono text-xl font-semibold text-slate-950">
                          ₹{cart.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-6">
                    <CheckoutAction
                      total={cart.total}
                      onClick={() => navigate("/patient/checkout")}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <LockKeyhole size={12} className="text-primary/70" />
                    Secure checkout on KapHealth
                  </div>

                  <div className="mt-5 border-t border-slate-200/70 pt-4 text-center">
                    <Link
                      to="/patient/store"
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-primary"
                    >
                      Continue browsing store
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoTile({ icon, title, body }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/75">
      <div className="text-primary">{icon}</div>
      <p className="mt-3 text-xs font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-[10px] leading-5 text-slate-400">{body}</p>
    </div>
  );
}
