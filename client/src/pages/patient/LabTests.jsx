import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FlaskConical,
  Search,
  ShieldCheck,
  TestTube2,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

export default function LabTests() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTests() {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/lab-tests");

      console.log("[LAB TESTS] API response:", data);

      const list =
        data?.tests ||
        data?.labTests ||
        data?.items ||
        (Array.isArray(data) ? data : []);

      setTests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("[LAB TESTS] Load error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load lab tests. Please try again."
      );

      setTests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  function toggleTest(test) {
    setSelected((current) => {
      const exists = current.some((item) => item._id === test._id);

      if (exists) {
        return current.filter((item) => item._id !== test._id);
      }

      return [...current, test];
    });
  }

  function continueToCheckout() {
    if (selected.length === 0) return;

    sessionStorage.setItem(
      "kap_lab_selection",
      JSON.stringify(selected)
    );

    navigate("/patient/lab-tests/checkout");
  }

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tests;

    return tests.filter((test) => {
      const text = [
        test.name,
        test.code,
        test.category,
        test.description,
        ...(Array.isArray(test.tags) ? test.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [tests, search]);

  const total = selected.reduce(
    (sum, test) => sum + Number(test.price || 0),
    0
  );

  return (
    <div className="lab-tests-page min-h-screen bg-white text-black">
      <style>{`
        .lab-tests-page {
          background: #ffffff !important;
          color: #000000 !important;
        }
        .lab-tests-page h1,
        .lab-tests-page h2,
        .lab-tests-page h3,
        .lab-tests-page p,
        .lab-tests-page span,
        .lab-tests-page a,
        .lab-tests-page label,
        .lab-tests-page input,
        .lab-tests-page button {
          color: #000000 !important;
        }
        .lab-tests-page input {
          background: #ffffff !important;
          color: #000000 !important;
          caret-color: #000000 !important;
        }
        .lab-tests-page input::placeholder {
          color: #64748b !important;
          opacity: 1 !important;
        }
        .lab-tests-page .lab-white-text {
          color: rgba(10, 9, 9, 0.72) !important;
        }
        .lab-tests-page .lab-primary-text {
          color: #0f766e !important;
        }
      `}</style>
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/patient"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-primary"
          >
            <ArrowRight
              size={14}
              className="rotate-180"
            />
            Back
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary lab-primary-text">
                <FlaskConical size={18} />
                <span className="text-[10px] font-bold uppercase tracking-[.15em]">
                  Diagnostics
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Lab tests & diagnostics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                Browse available diagnostic tests, select one or more tests,
                and book an at-home sample collection.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <ShieldCheck size={15} className="text-primary" />
              Secure diagnostics
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-xl">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blood test, CBC, thyroid, vitamin..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadTests}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white lab-white-text"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={28}
                className="animate-spin text-primary"
              />
              <p className="text-sm text-slate-700">
                Loading lab tests...
              </p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredTests.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <TestTube2
              size={38}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-4 text-lg font-semibold text-black">
              No lab tests found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-700">
              {tests.length === 0
                ? "The diagnostic catalog is currently empty."
                : "Try a different search term."}
            </p>
          </div>
        )}

        {/* Tests */}
        {!loading && filteredTests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test) => {
              const isSelected = selected.some(
                (item) => item._id === test._id
              );

              return (
                <article
                  key={test._id}
                  className={[
                    "relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition",
                    isSelected
                      ? "border-primary/40 ring-2 ring-primary/10"
                      : "border-slate-200/70 hover:-translate-y-0.5 hover:shadow-md",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary lab-primary-text">
                      <TestTube2 size={19} />
                    </div>

                    {isSelected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white lab-white-text">
                        <Check size={14} />
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 text-base font-semibold text-black">
                    {test.name || "Diagnostic Test"}
                  </h2>

                  {test.category && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.12em] text-primary lab-primary-text">
                      {test.category}
                    </p>
                  )}

                  {test.description && (
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-700">
                      {test.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-mono text-lg font-semibold text-black">
                      ₹{Number.isFinite(Number(test.price)) ? Number(test.price) : 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleTest(test)}
                      className={[
                        "rounded-full px-4 py-2 text-xs font-bold transition",
                        isSelected
                          ? "bg-primary text-white lab-white-text"
                          : "bg-primary/10 text-primary lab-primary-text hover:bg-primary hover:text-white",
                      ].join(" ")}
                    >
                      {isSelected
                        ? "Selected"
                        : "Select test"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom selection bar */}
        {selected.length > 0 && (
          <div className="sticky bottom-4 z-30 mt-8 rounded-3xl border border-white bg-slate-950 p-4 text-white shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-white/80">
                  Selected tests
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {selected.length}{" "}
                  {selected.length === 1 ? "test" : "tests"}
                  {" · "}
                  ₹{Number.isFinite(total) ? total : 0}
                </p>
              </div>

              <button
                type="button"
                onClick={continueToCheckout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 lab-primary-text"
              >
                Continue to booking
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}