import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, CreditCard, Banknote } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const TIME_SLOTS = ["07:00 AM - 09:00 AM", "09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function LabTestCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(tomorrow());
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("kap_lab_selection");
    if (!raw) return navigate("/patient/lab-tests");
    setTests(JSON.parse(raw));
  }, [navigate]);

  const total = tests.reduce((s, t) => s + t.price, 0);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/lab-tests/bookings", {
        testIds: tests.map((t) => t._id),
        scheduledDate,
        timeSlot,
        collectionAddress: address,
        paymentMethod,
        bookingFor,
      });
      sessionStorage.removeItem("kap_lab_selection");

      if (paymentMethod === "cod" || data.devMode) {
        return navigate(`/patient/lab-bookings/${data.booking._id}`);
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth Diagnostics",
        order_id: data.razorpayOrderId,
        handler: async () => navigate(`/patient/lab-bookings/${data.booking._id}`),
        prefill: { name: user?.name },
        theme: { color: "#0F6E5B" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't complete the booking.");
    } finally {
      setPlacing(false);
    }
  }

  if (tests.length === 0) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Book diagnostics</p>
        <h1 className="font-display text-2xl font-medium">Confirm your lab test booking</h1>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium"><FlaskConical size={18} /> Tests</h2>
            <div className="space-y-2 text-sm">
              {tests.map((t) => (
                <div key={t._id} className="flex justify-between"><span>{t.name}</span><span className="font-mono">₹{t.price}</span></div>
              ))}
              <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>₹{total}</span></div>
            </div>
          </div>

          <BookingForPicker value={bookingFor} onChange={setBookingFor} />

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Collection schedule</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="input" type="date" required min={tomorrow()} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              <select className="input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-medium">Collection address</h2>
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
                <Banknote size={16} /> Pay at home
              </button>
              <button type="button" onClick={() => setPaymentMethod("online")} className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${paymentMethod === "online" ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}>
                <CreditCard size={16} /> Pay online
              </button>
            </div>
          </div>

          {error && <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent backdrop-blur-md">{error}</p>}

          <button disabled={placing} className="btn-primary w-full">{placing ? "Booking..." : `Confirm booking · ₹${total}`}</button>
        </form>
      </div>
    </div>
  );
}
