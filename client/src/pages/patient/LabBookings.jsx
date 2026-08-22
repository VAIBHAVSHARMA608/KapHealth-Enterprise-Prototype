import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = { booked: "pending", sample_collected: "processing", processing: "processing", report_ready: "success", cancelled: "danger" };
const LABEL = { booked: "Booked", sample_collected: "Sample collected", processing: "Processing", report_ready: "Report ready", cancelled: "Cancelled" };

export default function LabBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get("/lab-tests/bookings/mine").then(({ data }) => setBookings(data.bookings));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow mb-2">Diagnostics</p>
        <h1 className="font-display text-2xl font-medium">Your lab bookings</h1>

        {bookings.length === 0 && (
          <div className="card mt-6 p-8 text-center">
            <FlaskConical size={28} className="mx-auto text-muted" />
            <p className="mt-3 text-sm text-muted">No lab tests booked yet.</p>
            <Link to="/patient/lab-tests" className="btn-primary mt-4 inline-flex">Book a test</Link>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <Link key={b._id} to={`/patient/lab-bookings/${b._id}`} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{b.bookingNumber}</p>
                <p className="mt-0.5 text-xs text-muted">{b.tests.map((t) => t.name).join(", ")}</p>
                <p className="mt-0.5 text-xs text-muted">{new Date(b.scheduledDate).toLocaleDateString()} · {b.timeSlot}</p>
              </div>
              <StatusBadge tone={TONE[b.status]}>{LABEL[b.status]}</StatusBadge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
