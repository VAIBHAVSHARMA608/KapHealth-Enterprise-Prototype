import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminComplaints() {
  const { adminApi } = useAdminAuth();
  const [complaints, setComplaints] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [reply, setReply] = useState({});

  function load() {
    adminApi.get("/complaints", { params: roleFilter ? { authorRole: roleFilter } : {} }).then(({ data }) => setComplaints(data.complaints));
  }
  useEffect(load, [adminApi, roleFilter]);

  async function respond(id, status) {
    await adminApi.patch(`/complaints/${id}/respond`, { message: reply[id] || "", status });
    setReply((r) => ({ ...r, [id]: "" }));
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Complaints</h1>
      <div className="mt-4 flex gap-2">
        {["", "patient", "doctor"].map((r) => (
          <button key={r || "all"} onClick={() => setRoleFilter(r)} className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${roleFilter === r ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}>
            {r || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {complaints.length === 0 && <p className="text-muted">No complaints here.</p>}
        {complaints.map((c) => (
          <div key={c._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.subject}</p>
                <p className="text-xs text-muted">{c.author?.name} ({c.authorRole}) · {c.category.replace(/_/g, " ")}</p>
              </div>
              <span className="badge bg-black/5 text-muted capitalize">{c.status.replace("_", " ")}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{c.description}</p>

            {c.adminResponses.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-line pt-3">
                {c.adminResponses.map((r, i) => <p key={i} className="rounded-lg bg-primary-light px-3 py-2 text-xs text-primary-dark">{r.message}</p>)}
              </div>
            )}

            {c.status !== "closed" && (
              <div className="mt-3 flex gap-2">
                <input className="input" placeholder="Reply..." value={reply[c._id] || ""} onChange={(e) => setReply((r) => ({ ...r, [c._id]: e.target.value }))} />
                <button onClick={() => respond(c._id, "in_review")} className="btn-secondary !px-3 shrink-0">Reply</button>
                <button onClick={() => respond(c._id, "resolved")} className="btn-primary !px-3 shrink-0">Resolve</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
