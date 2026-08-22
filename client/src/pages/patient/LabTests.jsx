import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FlaskConical, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LabTests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState([]); // array of test objects

  useEffect(() => {
    api.get("/lab-tests/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  const load = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    api.get("/lab-tests", { params }).then(({ data }) => setTests(data.tests));
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function toggleSelect(test) {
    setSelected((sel) => (sel.some((t) => t._id === test._id) ? sel.filter((t) => t._id !== test._id) : [...sel, test]));
  }

  function proceed() {
    if (!user) return navigate("/login");
    if (selected.length === 0) return;
    sessionStorage.setItem("kap_lab_selection", JSON.stringify(selected));
    navigate("/patient/lab-tests/checkout");
  }

  const total = selected.reduce((s, t) => s + t.price, 0);

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="eyebrow mb-2">Diagnostics</p>
        <h1 className="font-display text-3xl font-medium">Book a lab test at home</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          A trained phlebotomist collects your sample at home. Select one or more tests to bundle into a single visit.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Search tests (e.g. thyroid, diabetes)" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${!category ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:text-ink"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${category === c.name ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:text-ink"}`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const isSelected = selected.some((t) => t._id === test._id);
            return (
              <button
                key={test._id}
                onClick={() => toggleSelect(test)}
                className={`card p-4 text-left transition ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="eyebrow">{test.category}</span>
                  {isSelected && <CheckCircle2 size={18} className="text-primary" />}
                </div>
                <h3 className="mt-2 font-display text-base font-medium">{test.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{test.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
                  <span>{test.sampleType} sample</span>
                  {test.fastingRequired && <span>· Fasting required</span>}
                  <span>· Report in {test.reportTimeHours}h</span>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-mono text-lg font-semibold">₹{test.price}</p>
                  {test.mrp > test.price && <p className="font-mono text-xs text-muted line-through">₹{test.mrp}</p>}
                </div>
              </button>
            );
          })}
        </div>

        {tests.length === 0 && <p className="mt-10 text-center text-sm text-muted">No tests match your search.</p>}
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 text-sm">
              <FlaskConical size={18} className="text-primary" />
              <span>{selected.length} test{selected.length > 1 ? "s" : ""} selected · <span className="font-mono font-semibold">₹{total}</span></span>
            </div>
            <button onClick={proceed} className="btn-primary">Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
