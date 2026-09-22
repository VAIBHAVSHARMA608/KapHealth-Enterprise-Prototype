import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LifeBuoy, Search, MessageCircle, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  ["appointment_issue", "Appointment issue"],
  ["video_call_issue", "Video call issue"],
  ["prescription_issue", "Prescription issue"],
  ["order_delivery_issue", "Order / delivery issue"],
  ["payment_issue", "Payment issue"],
  ["account_issue", "Account issue"],
  ["other", "Other"],
];

export default function Help() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ category: "other", subject: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [faqLoadError, setFaqLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFaqLoadError("");
    api
      .get("/faqs", { params: { audience: user?.role || "patient" } })
      .then(({ data }) => setFaqs(data.faqs || []))
      .catch(() => {
        setFaqs([]);
        setFaqLoadError("The help service is temporarily unavailable. Please try again shortly.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question?.toLowerCase().includes(query) ||
        faq.answer?.toLowerCase().includes(query)
    );
  }, [faqs, search]);

  async function submitComplaint(e) {
    e.preventDefault();
    setError("");

    if (!user) return setError("Log in first to contact support.");

    setSubmitting(true);
    try {
      await api.post("/complaints", form);
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit, try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="help-page min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:py-12">
        {/* Hero */}
        <section className="help-hero relative overflow-hidden rounded-[2rem] p-7 text-white shadow-2xl sm:p-10">
          <div className="help-orb help-orb-one" />
          <div className="help-orb help-orb-two" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="help-pill">
                <LifeBuoy size={13} /> Help center
              </span>
              <span className="help-pill help-pill-green">
                <ShieldCheck size={13} /> Secure support
              </span>
            </div>

            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              How can we help?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Find quick answers, troubleshoot your care journey, or reach the
              KapHealth support team when the internet's greatest achievement,
              a confusing error message, has struck again.
            </p>

            <div className="help-search mt-7">
              <Search size={18} className="shrink-0 text-white/45" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpenIdx(null);
                }}
                placeholder="Search questions, payments, appointments..."
                aria-label="Search FAQs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs font-semibold text-white/45 transition hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Sparkles size={13} /> Knowledge base
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">
                Frequently asked questions
              </h2>
            </div>
            <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 shadow-sm ring-1 ring-slate-200 sm:inline-flex">
              {filteredFaqs.length} answers
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="faq-skeleton h-16 rounded-2xl" />
              ))
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const originalIndex = faqs.indexOf(faq);
                const isOpen = openIdx === originalIndex;

                return (
                  <div
                    key={faq._id}
                    className={`faq-card ${isOpen ? "faq-card-open" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : originalIndex)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 p-5 text-left"
                    >
                      <span className={`faq-number ${isOpen ? "faq-number-open" : ""}`}>
                        {String(originalIndex + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-800">
                        {faq.question}
                      </span>

                      <span className={`faq-chevron ${isOpen ? "faq-chevron-open" : ""}`}>
                        <ChevronDown size={16} />
                      </span>
                    </button>

                    <div className={`faq-answer ${isOpen ? "faq-answer-open" : ""}`}>
                      <p className="border-t border-slate-100 px-5 pb-5 pt-4 pl-[4.65rem] text-sm leading-6 text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : faqLoadError ? (
              <div className="help-empty">
                <p>{faqLoadError}</p>
              </div>
            ) : (
              <div className="help-empty">
                <Search size={22} />
                <p className="mt-3 font-semibold text-slate-800">No matching answers</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different search or contact support below.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Support */}
        <section className="support-card mt-10 overflow-hidden rounded-[2rem]">
          <div className="relative p-7 sm:p-9">
            <div className="support-glow" />

            <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
              <div>
                <span className="help-pill help-pill-dark">
                  <MessageCircle size={13} /> Human support
                </span>

                <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
                  Still stuck?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                  Raise a complaint with the details of what went wrong.
                  Our team can review it and follow up with you.
                </p>

                {!showForm && !submitted && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="support-button mt-6"
                  >
                    Contact support <ArrowRight size={15} />
                  </button>
                )}

                {submitted && (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
                    <ShieldCheck size={16} />
                    Complaint submitted. We'll follow up soon.
                  </div>
                )}
              </div>

              <div className="support-side">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300">
                  <LifeBuoy size={21} />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Need a real person?</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Include your issue, category and useful context so support
                  doesn't have to play detective.
                </p>
              </div>
            </div>
          </div>

          {showForm && !submitted && (
            <form onSubmit={submitComplaint} className="support-form">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="support-label">Issue category</span>
                  <select
                    className="support-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="support-label">Subject</span>
                  <input
                    className="support-input"
                    placeholder="What went wrong?"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </label>
              </div>

              <label className="block">
                <span className="support-label">Description</span>
                <textarea
                  className="support-input min-h-32 resize-y"
                  rows={5}
                  placeholder="Describe the issue and what you were trying to do..."
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="support-cancel"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  className="support-submit"
                >
                  {submitting ? "Submitting..." : "Submit complaint"}
                  {!submitting && <ArrowRight size={15} />}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <style>{`
        .help-page {
          background:
            radial-gradient(circle at 5% 8%, rgba(16,185,129,.08), transparent 26rem),
            radial-gradient(circle at 95% 42%, rgba(20,184,166,.07), transparent 28rem),
            #f5faf8;
        }

        .help-hero {
          background:
            radial-gradient(circle at 75% 20%, rgba(163,230,53,.12), transparent 18rem),
            linear-gradient(135deg, #071713 0%, #0a2520 52%, #071512 100%);
        }

        .help-orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
          border: 1px solid rgba(190,242,100,.08);
        }

        .help-orb-one {
          width: 260px;
          height: 260px;
          right: -90px;
          top: -110px;
          background: rgba(163,230,53,.07);
          box-shadow: 0 0 100px rgba(163,230,53,.08);
        }

        .help-orb-two {
          width: 180px;
          height: 180px;
          right: 170px;
          bottom: -130px;
          background: rgba(20,184,166,.06);
        }

        .help-pill {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          border-radius: 999px;
          padding: .45rem .75rem;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.55);
        }

        .help-pill-green {
          border-color: rgba(163,230,53,.12);
          background: rgba(163,230,53,.06);
          color: rgba(190,242,100,.72);
        }

        .help-pill-dark {
          border-color: rgba(163,230,53,.14);
          background: rgba(163,230,53,.06);
          color: rgba(190,242,100,.78);
        }

        .help-search {
          display: flex;
          align-items: center;
          gap: .75rem;
          max-width: 650px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.07);
          border-radius: 1rem;
          padding: .8rem 1rem;
          backdrop-filter: blur(18px);
          box-shadow: 0 15px 45px rgba(0,0,0,.12);
        }

        .help-search:focus-within {
          border-color: rgba(163,230,53,.4);
          box-shadow: 0 0 0 4px rgba(163,230,53,.06);
        }

        .help-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font-size: .875rem;
        }

        .help-search input::placeholder {
          color: rgba(255,255,255,.38);
        }

        .faq-card {
          overflow: hidden;
          border: 1px solid rgba(226,232,240,.9);
          border-radius: 1.25rem;
          background: rgba(255,255,255,.78);
          box-shadow: 0 8px 30px rgba(15,23,42,.035);
          backdrop-filter: blur(12px);
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }

        .faq-card:hover {
          transform: translateY(-1px);
          border-color: rgba(15,110,91,.2);
          box-shadow: 0 14px 35px rgba(15,23,42,.07);
        }

        .faq-card-open {
          border-color: rgba(15,110,91,.25);
          box-shadow: 0 16px 42px rgba(15,110,91,.08);
        }

        .faq-number {
          display: flex;
          height: 2rem;
          width: 2rem;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: .7rem;
          background: #f1f5f9;
          color: #94a3b8;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 9px;
          font-weight: 800;
          transition: .25s ease;
        }

        .faq-number-open {
          background: rgba(15,110,91,.1);
          color: #0f6e5b;
        }

        .faq-chevron {
          display: flex;
          height: 2rem;
          width: 2rem;
          align-items: center;
          justify-content: center;
          border-radius: .7rem;
          background: #f8fafc;
          color: #94a3b8;
          transition: .25s ease;
        }

        .faq-chevron-open {
          transform: rotate(180deg);
          background: rgba(15,110,91,.1);
          color: #0f6e5b;
        }

        .faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows .3s ease, opacity .25s ease;
        }

        .faq-answer > p {
          overflow: hidden;
          margin: 0;
        }

        .faq-answer-open {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .faq-skeleton {
          background: linear-gradient(90deg, #e8f0ed 25%, #f6faf8 50%, #e8f0ed 75%);
          background-size: 200% 100%;
          animation: help-shimmer 1.4s infinite;
        }

        .help-empty {
          padding: 3rem 1rem;
          text-align: center;
          color: #94a3b8;
          border: 1px dashed #cbd5e1;
          border-radius: 1.5rem;
          background: rgba(255,255,255,.55);
        }

        .support-card {
          background: #07130f;
          box-shadow: 0 25px 70px rgba(4,25,19,.15);
        }

        .support-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          right: -100px;
          top: -130px;
          border-radius: 999px;
          background: rgba(163,230,53,.09);
          filter: blur(45px);
        }

        .support-side {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 1.25rem;
          background: rgba(255,255,255,.035);
          padding: 1.25rem;
        }

        .support-button,
        .support-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          border: 1px solid rgba(190,242,100,.3);
          border-radius: .8rem;
          background: #a3e635;
          color: #07130f;
          padding: .7rem 1rem;
          font-size: .8rem;
          font-weight: 800;
          transition: .25s ease;
        }

        .support-button:hover,
        .support-submit:hover {
          transform: translateY(-2px);
          background: #bef264;
          box-shadow: 0 12px 30px rgba(163,230,53,.15);
        }

        .support-form {
          display: grid;
          gap: 1rem;
          border-top: 1px solid rgba(255,255,255,.08);
          background: #fff;
          padding: 1.5rem;
        }

        .support-label {
          display: block;
          margin-bottom: .4rem;
          font-size: .68rem;
          font-weight: 800;
          letter-spacing: .04em;
          color: #64748b;
        }

        .support-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          outline: none;
          border-radius: .8rem;
          background: #f8fafc;
          padding: .75rem .85rem;
          font-size: .875rem;
          color: #0f172a;
          transition: .2s ease;
        }

        .support-input:focus {
          border-color: rgba(15,110,91,.4);
          background: white;
          box-shadow: 0 0 0 4px rgba(15,110,91,.06);
        }

        .support-cancel {
          border-radius: .8rem;
          padding: .7rem 1rem;
          font-size: .8rem;
          font-weight: 700;
          color: #64748b;
          transition: .2s ease;
        }

        .support-cancel:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .support-submit {
          background: #0f6e5b;
          border-color: #0f6e5b;
          color: white;
        }

        .support-submit:hover {
          background: #0b5a4a;
        }

        @keyframes help-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-card,
          .faq-chevron,
          .faq-answer,
          .faq-number,
          .support-button,
          .support-submit {
            transition: none;
          }

          .faq-card:hover,
          .support-button:hover,
          .support-submit:hover {
            transform: none;
          }

          .faq-skeleton {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
