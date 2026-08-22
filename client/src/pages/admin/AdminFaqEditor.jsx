import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

export default function AdminFaqEditor() {
  const { adminApi } = useAdminAuth();

  const [faqs, setFaqs] = useState([]);

  const [form, setForm] = useState({
    audience: "both",
    question: "",
    answer: "",
    category: "general",
  });

  function load() {
    fetch("/api/faqs?audience=both")
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs));
  }

  useEffect(load, []);

  async function createFaq(e) {
    e.preventDefault();

    await adminApi.post("/faqs", form);

    setForm({
      audience: "both",
      question: "",
      answer: "",
      category: "general",
    });

    load();
  }

  async function removeFaq(id) {
    await adminApi.delete(`/faqs/${id}`);
    load();
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">

        <div className="flex items-center gap-4">

          <HelpCircle size={34} />

          <div>

            <h1 className="text-3xl font-bold">
              FAQ Management
            </h1>

            <p className="mt-2 text-white/80">
              Create, edit and manage help articles.
            </p>

          </div>

        </div>

      </div>

      {/* Form */}

      <form
        onSubmit={createFaq}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">

          <Plus size={20} />

          Add New FAQ

        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <select
            className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            value={form.audience}
            onChange={(e) =>
              setForm({
                ...form,
                audience: e.target.value,
              })
            }
          >
            <option value="both">Both</option>
            <option value="patient">
              Patients
            </option>
            <option value="doctor">
              Doctors
            </option>
          </select>

          <input
            className="rounded-xl border p-3 outline-none focus:border-emerald-500"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

        </div>

        <input
          className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500"
          placeholder="Question"
          required
          value={form.question}
          onChange={(e) =>
            setForm({
              ...form,
              question: e.target.value,
            })
          }
        />

        <textarea
          rows={4}
          className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-emerald-500"
          placeholder="Answer"
          required
          value={form.answer}
          onChange={(e) =>
            setForm({
              ...form,
              answer: e.target.value,
            })
          }
        />

        <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700">

          <Plus size={18} />

          Add FAQ

        </button>

      </form>

      {/* FAQ List */}

      {faqs.length === 0 ? (

        <div className="rounded-3xl border bg-white py-20 text-center shadow-sm">

          <BookOpen
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-semibold">
            No FAQs Available
          </h2>

          <p className="mt-2 text-slate-500">
            Create your first FAQ.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {faqs.map((faq) => (

            <div
              key={faq._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex-1">

                  <h3 className="font-semibold text-slate-800">
                    {faq.question}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {faq.answer}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {faq.category}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                      {faq.audience}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() =>
                    removeFaq(faq._id)
                  }
                  className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}