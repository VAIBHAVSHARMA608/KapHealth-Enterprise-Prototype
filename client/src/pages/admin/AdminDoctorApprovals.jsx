import { useEffect, useState } from "react";
import {
  Check,
  X,
  MessageCircleQuestion,
  UserRound,
  Stethoscope,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminDoctorApprovals() {
  const { adminApi } = useAdminAuth();

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("pending_review");

  function load() {
    adminApi
      .get("/doctors", {
        params: { status: filter },
      })
      .then(({ data }) =>
        setApplications(data.applications)
      );
  }

  useEffect(load, [adminApi, filter]);

  async function review(id, decision) {
    const note =
      decision !== "approved"
        ? window.prompt(
            "Review Note (optional)"
          ) || ""
        : "";

    await adminApi.patch(
      `/doctors/${id}/review`,
      {
        decision,
        note,
      }
    );

    load();
  }

  return (
    <div className="space-y-8">

      {/* Hero */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">

        <h1 className="text-3xl font-bold">
          Doctor Verification
        </h1>

        <p className="mt-2 text-white/80">
          Review and verify doctor onboarding
          applications.
        </p>

      </div>

      {/* Filters */}

      <div className="flex flex-wrap gap-3">

        {[
          "pending_review",
          "approved",
          "rejected",
          "changes_requested",
        ].map((status) => (

          <button
            key={status}
            onClick={() =>
              setFilter(status)
            }
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === status
                ? "bg-emerald-600 text-white shadow-lg"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            {status.replaceAll("_", " ")}
          </button>

        ))}

      </div>

      {/* Empty */}

      {applications.length === 0 && (

        <div className="rounded-3xl border bg-white py-20 text-center shadow-sm">

          <Stethoscope
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-semibold">
            No Applications Found
          </h2>

          <p className="mt-2 text-slate-500">
            Nothing to review right now.
          </p>

        </div>

      )}

      {/* Cards */}

      <div className="space-y-6">

        {applications.map((doctor) => (

          <div
            key={doctor._id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
          >

            <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

              <div className="flex gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">

                  <UserRound size={26} />

                </div>

                <div>

                  <h2 className="text-xl font-semibold">

                    {doctor.user.name}

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {doctor.user.email ||
                      doctor.user.phone}

                  </p>

                </div>

              </div>

              {filter === "pending_review" && (

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      review(
                        doctor._id,
                        "approved"
                      )
                    }
                    className="rounded-xl bg-emerald-500 p-3 text-white transition hover:bg-emerald-600"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    onClick={() =>
                      review(
                        doctor._id,
                        "changes_requested"
                      )
                    }
                    className="rounded-xl bg-amber-500 p-3 text-white transition hover:bg-amber-600"
                  >
                    <MessageCircleQuestion
                      size={18}
                    />
                  </button>

                  <button
                    onClick={() =>
                      review(
                        doctor._id,
                        "rejected"
                      )
                    }
                    className="rounded-xl bg-red-500 p-3 text-white transition hover:bg-red-600"
                  >
                    <X size={18} />
                  </button>

                </div>

              )}

            </div>

            {/* Details */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <InfoCard
                title="Council"
                value={
                  doctor.registrationCouncil
                }
              />

              <InfoCard
                title="Registration No."
                value={
                  doctor.registrationNumber
                }
              />

              <InfoCard
                title="Registration Year"
                value={
                  doctor.registrationYear
                }
                icon={<Calendar size={15} />}
              />

              <InfoCard
                title="Experience"
                value={`${doctor.yearsOfExperience} Years`}
              />

              <InfoCard
                title="Consultation Fee"
                value={`₹${doctor.consultationFee}`}
                icon={<IndianRupee size={15} />}
              />

              <InfoCard
                title="Specialization"
                value={doctor.specializations.join(
                  ", "
                )}
              />

            </div>

            {doctor.adminReviewNote && (

              <div className="mt-5 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-700">

                <strong>Admin Note:</strong>

                <div className="mt-1">
                  {doctor.adminReviewNote}
                </div>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">

        {icon}

        {title}

      </div>

      <p className="font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
}