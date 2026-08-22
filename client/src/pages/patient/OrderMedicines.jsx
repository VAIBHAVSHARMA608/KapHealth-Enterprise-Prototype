import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Truck, CreditCard, Banknote } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function OrderMedicines() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rx, setRx] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [selections, setSelections] = useState({}); // medicineId -> qty
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get(`/prescriptions/${prescriptionId}`).then(({ data }) => setRx(data.prescription));
    api.get("/orders/medicines").then(({ data }) => setCatalog(data.medicines));
  }, [prescriptionId]);

  useEffect(() => {
    if (!rx || catalog.length === 0) return;
    // Pre-select catalog items whose name matches a prescribed medicine, qty = duration in strips (simplified: 1 per drug).
    const preset = {};
    rx.medicines.forEach((m) => {
      const match = catalog.find((c) => c.name.toLowerCase().includes(m.name.toLowerCase().split(" ")[0]));
      if (match) preset[match._id] = 1;
    });
    setSelections(preset);
  }, [rx, catalog]);

  const items = Object.entries(selections).filter(([, qty]) => qty > 0);
  const subtotal = items.reduce((sum, [medId, qty]) => {
    const med = catalog.find((c) => c._id === medId);
    return sum + (med ? med.sellingPrice * qty : 0);
  }, 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  function setQty(medId, qty) {
    setSelections((s) => ({ ...s, [medId]: Math.max(0, qty) }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    if (items.length === 0) return setError("Add at least one medicine.");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        prescriptionId,
        items: items.map(([medicineId, quantity]) => ({ medicineId, quantity })),
        deliveryAddress: address,
        paymentMethod,
      });

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
        name: "KapHealth Pharmacy",
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

  if (!rx) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading prescription...</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Order medicines</p>
        <h1 className="font-display text-2xl font-medium">Against your e-prescription</h1>

        <form onSubmit={placeOrder} className="mt-6 space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Items</h2>
            <div className="space-y-3">
              {catalog.map((med) => (
                <div key={med._id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted">₹{med.sellingPrice} / {med.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-7 w-7 rounded-full border border-line" onClick={() => setQty(med._id, (selections[med._id] || 0) - 1)}>−</button>
                    <span className="w-6 text-center font-mono text-sm">{selections[med._id] || 0}</span>
                    <button type="button" className="h-7 w-7 rounded-full border border-line" onClick={() => setQty(med._id, (selections[med._id] || 0) + 1)}>+</button>
                  </div>
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
            <div className="flex justify-between py-1"><span className="text-muted">Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between py-1"><span className="text-muted">Delivery</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>₹{total}</span></div>
          </div>

          {error && <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent backdrop-blur-md">{error}</p>}

          <button disabled={placing} className="btn-primary w-full"><Truck size={16} /> {placing ? "Placing order..." : `Place order · ₹${total}`}</button>
        </form>
      </div>
    </div>
  );
}
