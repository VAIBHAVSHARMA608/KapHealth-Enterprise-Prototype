import { useEffect, useState } from "react";
import { Check, X, MessageCircleQuestion } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminDoctorApprovals() {
  const { adminApi } = useAdminAuth();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("pending_review");

  function load() {
    adminApi.get("/doctors", { params: { status: filter } }).then(({ data }) => setApplications(data.applications));
  }
  useEffect(load, [adminApi, filter]);

  async function review(id, decision) {
    const note = decision !== "approved" ? window.prompt("Note for the doctor (optional):") || "" : "";
    await adminApi.patch(`/doctors/${id}/review`, { decision, note });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Doctor onboarding</h1>
      <div className="mt-4 flex gap-2">
        {["pending_review", "approved", "rejected", "changes_requested"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === s ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {applications.length === 0 && <p className="text-muted">No applications here.</p>}
        {applications.map((a) => (
          <div key={a._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-medium">{a.user.name}</p>
                <p className="text-sm text-muted">{a.user.email || a.user.phone}</p>
              </div>
              {filter === "pending_review" && (
                <div className="flex gap-2">
                  <button onClick={() => review(a._id, "approved")} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary"><Check size={16} /></button>
                  <button onClick={() => review(a._id, "changes_requested")} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700"><MessageCircleQuestion size={16} /></button>
                  <button onClick={() => review(a._id, "rejected")} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700"><X size={16} /></button>
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted sm:grid-cols-3">
              <p><span className="text-ink">Council:</span> {a.registrationCouncil}</p>
              <p><span className="text-ink">Reg. No:</span> {a.registrationNumber}</p>
              <p><span className="text-ink">Since:</span> {a.registrationYear}</p>
              <p><span className="text-ink">Experience:</span> {a.yearsOfExperience} yrs</p>
              <p><span className="text-ink">Fee:</span> ₹{a.consultationFee}</p>
              <p><span className="text-ink">Specialties:</span> {a.specializations.join(", ")}</p>
            </div>
            {a.adminReviewNote && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Note: {a.adminReviewNote}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
