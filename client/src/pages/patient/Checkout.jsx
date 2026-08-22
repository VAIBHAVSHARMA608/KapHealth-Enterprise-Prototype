import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, CreditCard, Banknote } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cart && cart.items.length === 0) navigate("/patient/store");
  }, [cart, navigate]);

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders/checkout-cart", { deliveryAddress: address, paymentMethod });
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
          await api.post("/payments/verify", response);
          navigate(`/patient/orders/${data.order._id}`);
        },
        prefill: { name: user?.name },
        theme: { color: "#0F6E5B" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't place the order.");
    } finally {
      setPlacing(false);
    }
  }

  if (!cart) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading...</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Checkout</p>
        <h1 className="font-display text-2xl font-medium">Essentials -- no prescription needed</h1>

        <form onSubmit={placeOrder} className="mt-6 space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Items</h2>
            <div className="space-y-2 text-sm">
              {cart.items.map(({ medicine, quantity, lineTotal }) => (
                <div key={medicine._id} className="flex justify-between">
                  <span>{medicine.name} × {quantity}</span>
                  <span className="font-mono">₹{lineTotal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Delivery address</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className="input col-span-2" placeholder="Address line 1" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <input className="input col-span-2" placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              <input className="input" placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input className="input" placeholder="State" required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <input className="input" placeholder="Pincode" required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
              <input className="input" placeholder="Phone" required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Payment</h2>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPaymentMethod("cod")} className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${paymentMethod === "cod" ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}>
                <Banknote size={16} /> Cash on delivery
              </button>
              <button type="button" onClick={() => setPaymentMethod("online")} className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${paymentMethod === "online" ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}>
                <CreditCard size={16} /> Pay online
              </button>
            </div>
          </div>

          <div className="card p-6 text-sm">
            <div className="flex justify-between py-1"><span className="text-muted">Subtotal</span><span>₹{cart.subtotal}</span></div>
            {cart.discount > 0 && <div className="flex justify-between py-1 text-primary"><span>Coupon discount</span><span>−₹{cart.discount}</span></div>}
            <div className="flex justify-between py-1"><span className="text-muted">Delivery</span><span>{cart.deliveryFee === 0 ? "Free" : `₹${cart.deliveryFee}`}</span></div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>₹{cart.total}</span></div>
          </div>

          {error && <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent backdrop-blur-md">{error}</p>}

          <button disabled={placing} className="btn-primary w-full"><Truck size={16} /> {placing ? "Placing order..." : `Place order · ₹${cart.total}`}</button>
        </form>
      </div>
    </div>
  );
}
