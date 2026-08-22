import { useEffect, useState } from "react";
import {
  MessageSquare,
  User,
  Filter,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminComplaints() {
  const { adminApi } = useAdminAuth();

  const [complaints, setComplaints] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [reply, setReply] = useState({});

  function load() {
    adminApi
      .get("/complaints", {
        params: roleFilter
          ? { authorRole: roleFilter }
          : {},
      })
      .then(({ data }) =>
        setComplaints(data.complaints)
      );
  }

  useEffect(load, [adminApi, roleFilter]);

  async function respond(id, status) {
    await adminApi.patch(
      `/complaints/${id}/respond`,
      {
        message: reply[id] || "",
        status,
      }
    );

    setReply((r) => ({
      ...r,
      [id]: "",
    }));

    load();
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">

        <div className="flex items-center gap-3">

          <MessageSquare size={34} />

          <div>

            <h1 className="text-3xl font-bold">
              Complaint Management
            </h1>

            <p className="mt-2 text-white/80">
              Review, respond and resolve
              patient & doctor complaints.
            </p>

          </div>

        </div>

      </div>

      {/* Filters */}

      <div className="flex flex-wrap items-center gap-3">

        <Filter size={18} className="text-slate-500" />

        {["", "patient", "doctor"].map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              roleFilter === r
                ? "bg-emerald-600 text-white shadow-lg"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            {r || "All Complaints"}
          </button>
        ))}

      </div>

      {/* Empty */}

      {complaints.length === 0 && (
        <div className="rounded-3xl border bg-white py-20 text-center shadow-sm">

          <MessageSquare
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-semibold">
            No Complaints Found
          </h2>

          <p className="mt-2 text-slate-500">
            Everything looks good 🎉
          </p>

        </div>
      )}

      {/* Cards */}

      <div className="space-y-6">

        {complaints.map((c) => (

          <div
            key={c._id}
            className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-xl"
          >

            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {c.subject}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">

                  <span className="flex items-center gap-2">
                    <User size={15} />
                    {c.author?.name}
                  </span>

                  <span className="capitalize">
                    {c.authorRole}
                  </span>

                  <span className="capitalize">
                    {c.category.replace(/_/g, " ")}
                  </span>

                </div>

              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  c.status === "resolved"
                    ? "bg-emerald-100 text-emerald-700"
                    : c.status === "in_review"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>

            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-700">
              {c.description}
            </div>

            {/* Replies */}

            {c.adminResponses.length > 0 && (

              <div className="mt-5 space-y-3">

                {c.adminResponses.map((r, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-4"
                  >
                    {r.message}
                  </div>

                ))}

              </div>

            )}

            {/* Reply */}

            {c.status !== "closed" && (

              <div className="mt-6 flex flex-col gap-3 lg:flex-row">

                <textarea
                  rows={3}
                  placeholder="Write your response..."
                  value={reply[c._id] || ""}
                  onChange={(e) =>
                    setReply((prev) => ({
                      ...prev,
                      [c._id]: e.target.value,
                    }))
                  }
                  className="flex-1 rounded-2xl border p-4 outline-none focus:border-emerald-500"
                />

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      respond(c._id, "in_review")
                    }
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-white hover:bg-amber-600"
                  >
                    <Clock size={18} />
                    Review
                  </button>

                  <button
                    onClick={() =>
                      respond(c._id, "resolved")
                    }
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
                  >
                    <CheckCircle size={18} />
                    Resolve
                  </button>

                </div>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}