import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, IndianRupee } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get("/doctors", { params: { search } })
        .then(({ data }) => setDoctors(data.doctors))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="eyebrow mb-2">Find a doctor</p>
        <h1 className="font-display text-2xl font-medium">Verified doctors, ready today</h1>

        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-9" placeholder="Search by name or specialty" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {loading && <p className="text-muted">Loading doctors...</p>}
          {!loading && doctors.length === 0 && (
            <p className="text-muted">No doctors found. Try a different search, or check back soon.</p>
          )}
          {doctors.map((d) => (
            <Link to={`/patient/doctors/${d.user._id}`} key={d._id} className="card flex gap-4 p-5 transition hover:border-primary/40">
              <img
                src={d.user.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${d.user.name}`}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium">{d.user.name}</h3>
                <p className="text-sm text-muted">{d.specializations.join(", ")}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {d.ratingAverage || "New"}</span>
                  <span className="flex items-center gap-1 text-muted"><IndianRupee size={14} /> {d.consultationFee} consult</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
