import { useEffect, useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Help() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "other", subject: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/faqs", { params: { audience: user?.role || "patient" } }).then(({ data }) => setFaqs(data.faqs));
  }, [user]);

  async function submitComplaint(e) {
    e.preventDefault();
    setError("");
    if (!user) return setError("Log in first to contact support.");
    try {
      await api.post("/complaints", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit, try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Help & FAQs</p>
        <h1 className="font-display text-2xl font-medium">Frequently asked questions</h1>

        <div className="mt-6 space-y-2">
          {faqs.map((f, i) => (
            <div key={f._id} className="card overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left text-sm font-medium">
                {f.question}
                <ChevronDown size={16} className={`transition ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && <p className="border-t border-line p-4 text-sm text-muted">{f.answer}</p>}
            </div>
          ))}
        </div>

        <div className="card mt-10 p-6">
          <div className="flex items-center gap-2"><LifeBuoy className="text-primary" size={20} /><h2 className="font-display text-lg font-medium">Still stuck?</h2></div>
          <p className="mt-1 text-sm text-muted">Raise a complaint and our team will get back to you.</p>

          {!showForm && !submitted && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Contact support</button>
          )}

          {showForm && !submitted && (
            <form onSubmit={submitComplaint} className="mt-4 space-y-3">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="appointment_issue">Appointment issue</option>
                <option value="video_call_issue">Video call issue</option>
                <option value="prescription_issue">Prescription issue</option>
                <option value="order_delivery_issue">Order / delivery issue</option>
                <option value="payment_issue">Payment issue</option>
                <option value="account_issue">Account issue</option>
                <option value="other">Other</option>
              </select>
              <input className="input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <textarea className="input" rows={4} placeholder="Describe the issue" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="btn-primary w-full">Submit complaint</button>
            </form>
          )}

          {submitted && <p className="mt-4 text-sm text-primary">Your complaint has been submitted. We'll follow up soon.</p>}
        </div>
      </div>
    </div>
  );
}
