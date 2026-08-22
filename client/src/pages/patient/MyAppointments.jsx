import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = { pending_payment: "pending", confirmed: "success", in_progress: "processing", completed: "gray", cancelled: "danger", no_show: "danger" };

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => { api.get("/appointments").then(({ data }) => setAppointments(data.appointments)); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">My appointments</p>
        <h1 className="font-display text-2xl font-medium">Upcoming & past check-ups</h1>
        <div className="mt-6 space-y-3">
          {appointments.length === 0 && <p className="text-muted">No appointments yet — <Link to="/patient/doctors" className="text-primary underline">find a doctor</Link>.</p>}
          {appointments.map((a) => (
            <Link key={a._id} to={`/patient/appointments/${a._id}`} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Dr. {a.doctor.name}</p>
                <p className="text-xs text-muted">{new Date(a.scheduledStart).toLocaleString()}</p>
              </div>
              <StatusBadge tone={TONE[a.status]}>{a.status.replace(/_/g, " ")}</StatusBadge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
