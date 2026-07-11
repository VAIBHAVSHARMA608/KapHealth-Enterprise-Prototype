import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, IndianRupee, Clock } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/** Generates the next 5 days x a handful of slots for demo purposes.
 *  In production this would read the doctor's `availability` + already-booked
 *  appointments to compute real open slots. */
function generateUpcomingSlots() {
  const days = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const slots = [9, 10, 11, 15, 16, 17].map((h) => {
      const slot = new Date(date);
      slot.setHours(h, 0, 0, 0);
      return slot;
    }).filter((s) => s > new Date());
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

export default function DoctorProfileBook() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const days = generateUpcomingSlots();

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(({ data }) => setProfile(data.profile));
    api.get(`/reviews/doctor/${doctorId}`).then(({ data }) => setReviews(data.reviews));
  }, [doctorId]);

  async function confirmBooking() {
    if (!user) return navigate("/login");
    if (!selectedSlot) return;
    setBooking(true);
    setError("");
    try {
      const { data } = await api.post("/appointments", {
        doctorId,
        scheduledStart: selectedSlot.toISOString(),
        reasonForVisit: reason,
        paymentMethod: "razorpay",
      });

      // Launch Razorpay checkout for the consultation fee.
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth",
        description: "Consultation fee",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          await api.post("/payments/verify", response);
          navigate(`/patient/appointments/${data.appointment._id}`);
        },
        prefill: { name: user.name },
        theme: { color: "#0F6E5B" },
      };
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError("Payment SDK not loaded. Add the Razorpay checkout script to index.html.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't book this slot.");
    } finally {
      setBooking(false);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading doctor profile...</p></div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="card flex flex-col gap-6 p-6 md:flex-row">
          <img
            src={profile.user.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${profile.user.name}`}
            className="h-24 w-24 rounded-full object-cover"
            alt=""
          />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-medium">{profile.user.name}</h1>
            <p className="text-muted">{profile.specializations.join(", ")} · {profile.yearsOfExperience} yrs experience</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {profile.ratingAverage || "New"} ({profile.ratingCount} reviews)</span>
              <span className="flex items-center gap-1 text-muted"><IndianRupee size={14} /> {profile.consultationFee} per consult</span>
            </div>
            {profile.bio && <p className="mt-3 text-sm text-muted">{profile.bio}</p>}
          </div>
        </div>

        <div className="card mt-6 p-6">
          <h2 className="font-display text-lg font-medium">Pick a slot</h2>
          <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
            {days.map(({ date, slots }) => (
              <div key={date.toDateString()} className="shrink-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <div className="flex flex-col gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.toISOString()}
                      onClick={() => setSelectedSlot(s)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${
                        selectedSlot?.getTime() === s.getTime() ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:border-primary/40"
                      }`}
                    >
                      <Clock size={13} /> {s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="label">Reason for visit (optional)</label>
            <textarea className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
          </div>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button disabled={!selectedSlot || booking} onClick={confirmBooking} className="btn-primary mt-6 w-full">
            {booking ? "Preparing checkout..." : `Book & pay ₹${profile.consultationFee}`}
          </button>
        </div>

        {reviews.length > 0 && (
          <div className="card mt-6 p-6">
            <h2 className="font-display text-lg font-medium">What patients say</h2>
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 text-sm font-medium">{r.author.name}
                    <span className="flex items-center gap-0.5 text-amber-600"><Star size={12} fill="currentColor" /> {r.rating}</span>
                  </div>
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
