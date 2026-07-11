import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = { pending_payment: "amber", confirmed: "green", in_progress: "coral", completed: "gray", cancelled: "red", no_show: "red" };

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/appointments").then(({ data }) => setAppointments(data.appointments));
    api.get("/doctors/me/profile").then(({ data }) => setProfile(data.profile)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow mb-2">Doctor dashboard</p>
        <h1 className="font-display text-2xl font-medium">Your schedule</h1>

        {profile && profile.onboardingStatus !== "approved" && (
          <div className="card mt-4 border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Your onboarding is <strong>{profile.onboardingStatus.replace("_", " ")}</strong>. You'll be bookable by
            patients once approved. {profile.adminReviewNote && <span> Note: {profile.adminReviewNote}</span>}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {appointments.length === 0 && <p className="text-muted">No appointments yet.</p>}
          {appointments.map((a) => (
            <div key={a._id} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{a.patient.name}</p>
                <p className="text-xs text-muted">{new Date(a.scheduledStart).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge tone={TONE[a.status]}>{a.status.replace(/_/g, " ")}</StatusBadge>
                {["confirmed", "in_progress"].includes(a.status) && (
                  <Link to={`/doctor/consult/${a._id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                    <Video size={14} /> Join
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
