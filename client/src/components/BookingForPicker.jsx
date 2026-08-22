import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "../services/api.js";

/**
 * Lets a patient pick "myself" or one of their saved dependents before
 * booking a consult or lab test. Calls onChange with either
 * { type: "self" } or { type: "dependent", dependentId, dependentName }.
 */
export default function BookingForPicker({ value, onChange }) {
  const [dependents, setDependents] = useState([]);

  useEffect(() => {
    api.get("/patients/me/profile").then(({ data }) => setDependents(data.profile?.dependents || []));
  }, []);

  if (dependents.length === 0) return null; // nothing to choose between yet

  return (
    <div className="card p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Users size={16} /> Who is this for?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ type: "self" })}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${value?.type !== "dependent" ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}
        >
          Myself
        </button>
        {dependents.map((d) => (
          <button
            key={d._id}
            type="button"
            onClick={() => onChange({ type: "dependent", dependentId: d._id, dependentName: d.name })}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${value?.type === "dependent" && value.dependentId === d._id ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted"}`}
          >
            {d.name} <span className="opacity-60">· {d.relation}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
