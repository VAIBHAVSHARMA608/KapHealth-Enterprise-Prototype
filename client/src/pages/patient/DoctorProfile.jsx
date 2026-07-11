import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, IndianRupee, CalendarDays, Clock } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/** Builds the next 5 days x half-hour slots 9am-5pm for demo purposes.
 *  In production this would come from the doctor's `availability` array
 *  minus already-booked appointments (returned by the backend). */
function buildSlots() {
  const days = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const slots = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(date);
        slot.setHours(h, m, 0, 0);
        if (slot > new Date()) slots.push(slot);
      }
    }
    days.push({ date, slots });
  }
  return days;
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const days = buildSlots();

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(({ data }) => setProfile(data.profile));
    api.get(`/reviews/doctor/${doctorId}`).then(({ data }) => setReviews(data.reviews)).catch(() => {});
  }, [doctorId]);

  async function loadRazorpayScript() {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function bookAndPay() {
    if (!user) return navigate("/login");
    if (!selectedSlot) return setError("Pick a time slot first.");
    setError("");
    setBooking(true);
    try {
      const { data } = await api.post("/appointments", {
        doctorId,
        scheduledStart: selectedSlot.toISOString(),
        reasonForVisit: reason,
      });

      const ok = await loadRazorpayScript();
      if (!ok) {
        setError("Couldn't load payment gateway. Check your connection and try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth",
        description: "Doctor consultation fee",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          await api.post("/payments/verify", response);
          navigate(`/patient/appointments/${data.appointment._id}`);
        },
        prefill: { name: user.name, contact: user.phone || "" },
        theme: { color: "#0F6E5B" },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't book this slot.");
    } finally {
      setBooking(false);
    }
  }

  if (!profile) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading...</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="card flex flex-col gap-5 p-6 sm:flex-row">
          <img
            src={profile.user.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${profile.user.name}`}
            className="h-24 w-24 rounded-full object-cover"
            alt=""
          />
          <div>
            <h1 className="font-display text-2xl font-medium">{profile.user.name}</h1>
            <p className="text-muted">{profile.specializations.join(", ")} · {profile.yearsOfExperience} yrs experience</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {profile.ratingAverage || "New"} ({profile.ratingCount} reviews)</span>
              <span className="flex items-center gap-1 text-muted"><IndianRupee size={14} /> {profile.consultationFee} per consult</span>
            </div>
            {profile.bio && <p className="mt-3 max-w-xl text-sm text-muted">{profile.bio}</p>}
          </div>
        </div>

        <div className="mt-8 card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-medium"><CalendarDays size={18} /> Pick a slot</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {days.map(({ date, slots }) => (
              <div key={date.toDateString()} className="min-w-[140px] shrink-0">
                <p className="mb-2 text-xs font-semibold text-muted">{date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</p>
                <div className="flex flex-col gap-1.5">
                  {slots.slice(0, 6).map((s) => (
                    <button
                      key={s.toISOString()}
                      onClick={() => setSelectedSlot(s)}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                        selectedSlot?.getTime() === s.getTime() ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:border-primary/40"
                      }`}
                    >
                      <Clock size={12} /> {s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="label">Reason for visit (optional)</label>
            <textarea className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Fever and sore throat for 2 days" />
          </div>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button onClick={bookAndPay} disabled={booking} className="btn-primary mt-5 w-full sm:w-auto">
            {booking ? "Booking..." : `Book & pay ₹${profile.consultationFee}`}
          </button>
        </div>

        {reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-medium">Patient reviews</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><Star size={14} className="text-amber-500" fill="currentColor" /> {r.rating}/5 — {r.author?.name}</div>
                  {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
