import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminFaqEditor() {
  const { adminApi } = useAdminAuth();
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ audience: "both", question: "", answer: "", category: "general" });

  function load() {
    // Admin FAQ list reuses the public endpoint's shape but via own controller would be nicer;
    // for the demo we fetch through the public /api/faqs (published only) merged with admin CRUD.
    adminApi.get("/dashboard").catch(() => {}); // no-op warmup call, harmless
    fetch("/api/faqs?audience=both").then((r) => r.json()).then((d) => setFaqs(d.faqs));
  }
  useEffect(load, [adminApi]);

  async function createFaq(e) {
    e.preventDefault();
    await adminApi.post("/faqs", form);
    setForm({ audience: "both", question: "", answer: "", category: "general" });
    load();
  }

  async function removeFaq(id) {
    await adminApi.delete(`/faqs/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">FAQ editor</h1>

      <form onSubmit={createFaq} className="card mt-6 space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="both">Both</option>
            <option value="patient">Patients only</option>
            <option value="doctor">Doctors only</option>
          </select>
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <input className="input" placeholder="Question" required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <textarea className="input" placeholder="Answer" rows={2} required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        <button className="btn-primary"><Plus size={16} /> Add FAQ</button>
      </form>

      <div className="mt-6 space-y-2">
        {faqs.map((f) => (
          <div key={f._id} className="card flex items-start justify-between p-4">
            <div>
              <p className="text-sm font-medium">{f.question}</p>
              <p className="text-xs text-muted">{f.answer}</p>
            </div>
            <button onClick={() => removeFaq(f._id)} className="shrink-0 text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
