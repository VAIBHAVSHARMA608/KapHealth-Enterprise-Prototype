import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

const INITIAL_ADDRESS = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

function FloatingField({
  id,
  label,
  value,
  onChange,
  className = "",
  icon,
  ...props
}) {
  const filled = String(value ?? "").length > 0;

  return (
    <div className={`checkout-field group relative ${className}`}>
      <div className="relative rounded-2xl border border-slate-200/90 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_4px_15px_rgba(15,23,42,.025)] backdrop-blur-xl transition-all duration-300 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(15,110,91,.07),0_8px_24px_rgba(15,110,91,.07)]">
        {icon && (
          <span className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-primary">
            {icon}
          </span>
        )}

        <input
          id={id}
          value={value}
          onChange={onChange}
          placeholder=" "
          className="peer h-14 w-full appearance-none rounded-2xl bg-transparent px-4 pb-2.5 pt-5 pr-11 text-sm font-medium text-slate-900 outline-none"
          {...props}
        />

        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2",
            "text-sm font-medium text-slate-400 transition-all duration-300",
            "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:scale-[0.78]",
            "peer-focus:font-semibold peer-focus:text-primary",
            filled
              ? "top-2.5 translate-y-0 scale-[0.78] font-semibold text-slate-500"
              : "",
          ].join(" ")}
        >
          {label}
        </label>

        <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-focus-within:w-[calc(100%-2rem)]" />
      </div>
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex min-h-[94px] items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? "border-primary/25 bg-primary/[0.045] shadow-[0_12px_28px_rgba(15,110,91,.08)]"
          : "border-slate-200/80 bg-white/60 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute -right-7 -top-7 h-16 w-16 rounded-full bg-primary/[0.08]",
          "transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          selected ? "scale-[3.6]" : "scale-0 group-hover:scale-[2.2]",
        ].join(" ")}
      />

      <div
        className={[
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
          selected
            ? "bg-primary text-white shadow-sm"
            : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {description}
        </p>
      </div>

      <span
        className={[
          "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
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

function CheckoutButton({ total, placing, paymentMethod }) {
  return (
    <button
      type="submit"
      disabled={placing}
      className="checkout-main-btn group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-[#0b0f0e] p-1 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="checkout-main-label absolute inset-1 z-10 flex items-center justify-center rounded-full bg-[#0b0f0e] px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all duration-500">
        {placing
          ? "Processing order..."
          : `${paymentMethod === "online" ? "Continue to payment" : "Place order"} · ₹${total}`}
      </span>

      <span className="checkout-main-icons absolute inset-0 z-20 flex items-center justify-center gap-5 text-white opacity-0 transition-all duration-500">
        <ShieldCheck size={18} />
        <Truck size={18} />
        <ArrowRight size={18} />
      </span>

      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-50" />
    </button>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cart && cart.items.length === 0) {
      navigate("/patient/store", { replace: true });
    }
  }, [cart, navigate]);

  function updateAddress(field, value) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      const { data } = await api.post("/orders/checkout-cart", {
        deliveryAddress: address,
        paymentMethod,
      });

      await refreshCart();

      if (paymentMethod === "cod") {
        return navigate(`/patient/orders/${data.order._id}`);
      }

      if (data.devMode) {
        return navigate(`/patient/orders/${data.order._id}`);
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth Store",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            navigate(`/patient/orders/${data.order._id}`);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please check your order status."
            );
          } finally {
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
          "Couldn't place the order. Please try again."
      );
      setPlacing(false);
    }
  }

  const itemCount = useMemo(
    () =>
      cart?.items?.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ) || 0,
    [cart]
  );

  if (!cart) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />
        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag size={24} className="animate-pulse" />
            </div>
            <p className="eyebrow mt-5">Secure checkout</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Preparing your order
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              We're loading your cart and getting checkout ready.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .checkout-main-label {
          transition:
            opacity .35s ease,
            transform .5s cubic-bezier(.68,-.55,.265,1.55);
        }

        .checkout-main-icons {
          transform: scale(.65);
        }

        .checkout-main-btn:hover .checkout-main-label {
          transform: translateY(-54px) scale(.45);
          opacity: 0;
        }

        .checkout-main-btn:hover .checkout-main-icons {
          transform: scale(1);
          opacity: 1;
        }

        .checkout-field input:-webkit-autofill,
        .checkout-field input:-webkit-autofill:hover,
        .checkout-field input:-webkit-autofill:focus {
          -webkit-text-fill-color: #0f172a;
          -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,.75) inset;
          transition: background-color 9999s ease-in-out 0s;
        }

        @media (prefers-reduced-motion: reduce) {
          .checkout-main-label,
          .checkout-main-icons {
            transition: none !important;
          }

          .checkout-main-btn:hover .checkout-main-label {
            transform: none;
            opacity: 1;
          }

          .checkout-main-btn:hover .checkout-main-icons {
            opacity: 0;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-16 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-7">
          <Link
            to="/patient/cart"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to cart
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <LockKeyhole size={13} />
                Secure checkout
              </p>

              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Complete your order.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Delivery, payment, confirmation. Everything in one focused
                checkout flow.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl">
              <ShieldCheck size={13} className="text-primary" />
              Protected checkout
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center">
            <div className="flex flex-1 items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                <Check size={13} />
              </span>
              <span className="text-[11px] font-semibold text-slate-800">
                Delivery
              </span>
            </div>

            <div className="h-px w-10 bg-primary/20 sm:w-20" />

            <div className="flex flex-1 items-center justify-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold text-primary">
                2
              </span>
              <span className="text-[11px] font-medium text-slate-600">
                Payment
              </span>
            </div>

            <div className="h-px w-10 bg-slate-200 sm:w-20" />

            <div className="flex flex-1 items-center justify-end gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-400">
                3
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={placeOrder}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Items */}
              <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Your order
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/patient/cart"
                    className="text-[10px] font-semibold text-primary transition hover:text-primary/70"
                  >
                    Edit cart
                  </Link>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {cart.items.map(
                    ({ medicine, quantity, lineTotal }) => (
                      <div
                        key={medicine._id}
                        className="group flex items-center gap-4 p-4 transition hover:bg-white/45 sm:p-5"
                      >
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-primary/[0.05] text-primary shadow-sm transition-transform duration-500 group-hover:scale-[1.03]">
                          <Package size={22} strokeWidth={1.6} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {medicine.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            ₹{medicine.sellingPrice} / {medicine.unit}{" "}
                            <span className="mx-1 text-slate-300">·</span>
                            Qty {quantity}
                          </p>
                        </div>

                        <span className="font-mono text-sm font-semibold text-slate-900">
                          ₹{lineTotal}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Address */}
              <section className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <p className="eyebrow">Delivery</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Where should we deliver?
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Use a complete address where someone can receive the
                      order.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <FloatingField
                    id="line1"
                    label="Address line 1"
                    value={address.line1}
                    onChange={(e) =>
                      updateAddress("line1", e.target.value)
                    }
                    placeholder="House / apartment, street"
                    autoComplete="street-address"
                    required
                  />

                  <FloatingField
                    id="line2"
                    label="Address line 2"
                    value={address.line2}
                    onChange={(e) =>
                      updateAddress("line2", e.target.value)
                    }
                    className="sm:col-span-1"
                    placeholder="Area, landmark (optional)"
                    autoComplete="address-line2"
                  />

                  <FloatingField
                    id="city"
                    label="City"
                    value={address.city}
                    onChange={(e) =>
                      updateAddress("city", e.target.value)
                    }
                    placeholder="Chandigarh"
                    autoComplete="address-level2"
                    required
                  />

                  <FloatingField
                    id="state"
                    label="State"
                    value={address.state}
                    onChange={(e) =>
                      updateAddress("state", e.target.value)
                    }
                    placeholder="Punjab"
                    autoComplete="address-level1"
                    required
                  />

                  <FloatingField
                    id="pincode"
                    label="Pincode"
                    value={address.pincode}
                    onChange={(e) =>
                      updateAddress(
                        "pincode",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="160001"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                  />

                  <FloatingField
                    id="phone"
                    label="Delivery phone"
                    value={address.phone}
                    onChange={(e) =>
                      updateAddress("phone", e.target.value)
                    }
                    placeholder="+91 98765 43210"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.035] px-3.5 py-3 text-[10px] leading-5 text-slate-500">
                  <Home size={13} className="shrink-0 text-primary" />
                  Double-check your address before placing the order.
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard size={18} />
                  </div>

                  <div>
                    <p className="eyebrow">Payment</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Choose a payment method
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Select how you'd like to complete the purchase.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <PaymentOption
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    icon={<Banknote size={19} />}
                    title="Cash on delivery"
                    description="Pay when your order arrives."
                  />

                  <PaymentOption
                    selected={paymentMethod === "online"}
                    onClick={() => setPaymentMethod("online")}
                    icon={<CreditCard size={19} />}
                    title="Pay online"
                    description="Complete payment securely online."
                  />
                </div>

                {paymentMethod === "online" && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-[10px] leading-5 text-emerald-700">
                    <ShieldCheck size={13} />
                    A secure Razorpay payment window will open after you
                    continue.
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_22px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-6 text-white">
                  <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
                  <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-200/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <ShoppingBag size={17} />
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
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-800">
                        ₹{cart.subtotal}
                      </span>
                    </div>

                    {cart.discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Coupon discount</span>
                        <span className="font-medium">
                          −₹{cart.discount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-medium text-slate-800">
                        {cart.deliveryFee === 0
                          ? "Free"
                          : `₹${cart.deliveryFee}`}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-200/70 pt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Total
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Taxes and applicable fees included
                        </p>
                      </div>

                      <span className="font-mono text-xl font-semibold text-slate-950">
                        ₹{cart.total}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <CheckoutButton
                      total={cart.total}
                      placing={placing}
                      paymentMethod={paymentMethod}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50/80 p-3">
                      <ShieldCheck size={14} className="text-primary" />
                      <p className="mt-2 text-[10px] font-semibold text-slate-700">
                        Secure
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Protected checkout
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50/80 p-3">
                      <Truck size={14} className="text-primary" />
                      <p className="mt-2 text-[10px] font-semibold text-slate-700">
                        Trackable
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Delivery status
                      </p>
                    </div>
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
        </form>
      </main>
    </div>
  );
}
