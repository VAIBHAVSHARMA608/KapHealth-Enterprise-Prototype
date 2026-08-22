import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Tag, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useCart } from "../../context/CartContext.jsx";

export default function Cart() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCouponInput(cart?.couponCode || "");
  }, [cart?.couponCode]);

  async function updateQty(medicineId, quantity) {
    setBusy(true);
    try {
      await api.patch(`/store/cart/items/${medicineId}`, { quantity });
      await refreshCart();
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(medicineId) {
    setBusy(true);
    try {
      await api.delete(`/store/cart/items/${medicineId}`);
      await refreshCart();
    } finally {
      setBusy(false);
    }
  }

  async function applyCoupon(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/store/cart/coupon", { code: couponInput || null });
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid coupon");
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="p-10 text-muted">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow mb-2">Your cart</p>
        <h1 className="font-display text-2xl font-medium">Essentials cart</h1>

        {cart.items.length === 0 ? (
          <div className="card mt-6 p-8 text-center">
            <p className="text-sm text-muted">Your cart is empty.</p>
            <Link to="/patient/store" className="btn-primary mt-4 inline-flex">Browse the store</Link>
          </div>
        ) : (
          <>
            <div className="card mt-6 divide-y divide-line">
              {cart.items.map(({ medicine, quantity, lineTotal }) => (
                <div key={medicine._id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{medicine.name}</p>
                    <p className="text-xs text-muted">₹{medicine.sellingPrice} / {medicine.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button disabled={busy} className="h-7 w-7 rounded-full border border-line" onClick={() => updateQty(medicine._id, quantity - 1)}>−</button>
                      <span className="w-6 text-center font-mono text-sm">{quantity}</span>
                      <button disabled={busy} className="h-7 w-7 rounded-full border border-line" onClick={() => updateQty(medicine._id, quantity + 1)}>+</button>
                    </div>
                    <p className="w-16 text-right font-mono text-sm font-medium">₹{lineTotal}</p>
                    <button disabled={busy} onClick={() => removeItem(medicine._id)} className="text-muted hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={applyCoupon} className="card mt-4 flex items-center gap-2 p-4">
              <Tag size={16} className="text-muted" />
              <input
                className="input flex-1"
                placeholder="Coupon code (e.g. WELCOME50)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <button className="btn-secondary !px-4 !py-2 text-xs" disabled={busy}>Apply</button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {cart.couponError && !error && <p className="mt-2 text-sm text-red-600">{cart.couponError}</p>}

            <div className="card mt-4 p-6 text-sm">
              <div className="flex justify-between py-1"><span className="text-muted">Subtotal</span><span>₹{cart.subtotal}</span></div>
              {cart.discount > 0 && (
                <div className="flex justify-between py-1 text-primary"><span>Coupon discount</span><span>−₹{cart.discount}</span></div>
              )}
              <div className="flex justify-between py-1"><span className="text-muted">Delivery</span><span>{cart.deliveryFee === 0 ? "Free" : `₹${cart.deliveryFee}`}</span></div>
              <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>₹{cart.total}</span></div>
            </div>

            <button onClick={() => navigate("/patient/checkout")} className="btn-primary mt-4 w-full">
              Proceed to checkout <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
