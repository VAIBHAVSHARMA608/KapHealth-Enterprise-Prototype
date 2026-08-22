import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Video, FileText, Star } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const STATUS_TONE = {
  pending_payment: "pending", confirmed: "success", in_progress: "processing",
  completed: "gray", cancelled: "danger", no_show: "danger",
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${id}`).then(({ data }) => setAppointment(data.appointment));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    await api.post("/reviews", { targetType: "doctor", targetId: appointment.doctor._id, rating, comment });
    setReviewed(true);
  }

  if (!appointment) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading...</p></div>;

  const canJoin = ["confirmed", "in_progress"].includes(appointment.status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-xl font-medium">Dr. {appointment.doctor.name}</h1>
              <p className="text-sm text-muted">{new Date(appointment.scheduledStart).toLocaleString()}</p>
            </div>
            <StatusBadge tone={STATUS_TONE[appointment.status]}>{appointment.status.replace("_", " ")}</StatusBadge>
          </div>

          {canJoin && (
            <Link to={`/patient/consult/${appointment._id}`} className="btn-primary mt-6 w-full">
              <Video size={16} /> Join video consult
            </Link>
          )}

          {appointment.prescription && (
            <Link to={`/patient/prescriptions/${appointment.prescription._id}`} className="btn-secondary mt-3 w-full">
              <FileText size={16} /> View e-prescription
            </Link>
          )}
        </div>

        {appointment.status === "completed" && !reviewed && (
          <form onSubmit={submitReview} className="card mt-6 p-6">
            <h2 className="font-display text-lg font-medium">Rate this consult</h2>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={22} className={n <= rating ? "fill-amber-500 text-amber-500" : "text-line"} />
                </button>
              ))}
            </div>
            <textarea className="input mt-3" rows={3} placeholder="Optional feedback" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary mt-3 w-full">Submit review</button>
          </form>
        )}
        {reviewed && <p className="mt-6 text-center text-sm text-primary">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
