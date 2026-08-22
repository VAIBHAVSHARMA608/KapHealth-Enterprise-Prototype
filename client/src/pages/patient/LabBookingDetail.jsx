import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FlaskConical, FileText } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = { booked: "pending", sample_collected: "processing", processing: "processing", report_ready: "success", cancelled: "danger" };
const LABEL = { booked: "Booked", sample_collected: "Sample collected", processing: "Processing", report_ready: "Report ready", cancelled: "Cancelled" };
const STEPS = ["booked", "sample_collected", "processing", "report_ready"];

export default function LabBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api.get(`/lab-tests/bookings/${id}`).then(({ data }) => setBooking(data.booking));
  }, [id]);

  if (!booking) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading...</p></div>;

  const stepIndex = STEPS.indexOf(booking.status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">Booking {booking.bookingNumber}</p>
            <h1 className="font-display text-2xl font-medium">
              {booking.bookingFor?.type === "dependent" ? `For ${booking.bookingFor.dependentName}` : "Your lab test"}
            </h1>
          </div>
          {booking.status !== "cancelled" ? (
            <StatusBadge tone={TONE[booking.status]}>{LABEL[booking.status]}</StatusBadge>
          ) : (
            <StatusBadge tone="danger">Cancelled</StatusBadge>
          )}
        </div>

        {booking.status !== "cancelled" && (
          <div className="card mt-6 flex justify-between p-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center text-center">
                <div className={`h-3 w-3 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-slate-200"}`} />
                <p className={`mt-2 text-[11px] ${i <= stepIndex ? "text-ink" : "text-muted"}`}>{LABEL[s]}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-4 p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium"><FlaskConical size={18} /> Tests</h2>
          <div className="space-y-2 text-sm">
            {booking.tests.map((t, i) => (
              <div key={i} className="flex justify-between"><span>{t.name}</span><span className="font-mono">₹{t.price}</span></div>
            ))}
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>₹{booking.total}</span></div>
          </div>
        </div>

        <div className="card mt-4 p-6 text-sm">
          <h2 className="mb-2 font-display text-lg font-medium">Collection details</h2>
          <p>{new Date(booking.scheduledDate).toLocaleDateString()} · {booking.timeSlot}</p>
          <p className="mt-1 text-muted">{booking.collectionAddress?.line1}, {booking.collectionAddress?.city}</p>
        </div>

        {booking.reportUrl && (
          <a href={booking.reportUrl} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full">
            <FileText size={16} /> View report
          </a>
        )}
      </div>
    </div>
  );
}
