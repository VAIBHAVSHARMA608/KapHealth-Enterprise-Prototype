import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  FileImage,
  FileText,
  FolderOpen,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TYPE_LABEL = {
  lab_report: "Lab report",
  prescription: "Prescription",
  vaccination: "Vaccination",
  discharge_summary: "Discharge summary",
  insurance: "Insurance",
  scan_imaging: "Scan / imaging",
  other: "Other",
};

const TYPE_ICON = {
  lab_report: "LAB",
  prescription: "RX",
  vaccination: "VAC",
  discharge_summary: "DIS",
  insurance: "INS",
  scan_imaging: "IMG",
  other: "DOC",
};

const VAULT_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85";

function DocumentCard({ record, index, onRemove, removing }) {
  return (
    <article className="vault-card group relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,110,91,.10)]">
      <span className="vault-corner vault-corner-top" />
      <span className="vault-corner vault-corner-bottom" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-[10px] font-black tracking-[0.08em] text-white shadow-lg shadow-primary/15 transition duration-500 group-hover:scale-105 group-hover:rotate-[-3deg]">
          {record.fileUrl && /\.(jpg|jpeg|png)$/i.test(record.fileUrl) ? (
            <FileImage size={21} strokeWidth={1.7} />
          ) : (
            <FileText size={21} strokeWidth={1.7} />
          )}

          <span className="absolute bottom-1 right-1 rounded-md bg-white/15 px-1 py-0.5 text-[6px]">
            {TYPE_ICON[record.recordType] || "DOC"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <a
            href={record.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block min-w-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-primary">
                {record.title}
              </h2>

              <span className="shrink-0 rounded-full bg-primary/[0.06] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-primary">
                {TYPE_LABEL[record.recordType] || "Other"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
              <span>
                {new Date(record.recordDate).toLocaleDateString()}
              </span>

              {record.forDependentName && (
                <span className="font-medium text-slate-500">
                  For {record.forDependentName}
                </span>
              )}
            </div>

            {record.notes && (
              <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-400">
                {record.notes}
              </p>
            )}
          </a>
        </div>

        <button
          type="button"
          disabled={removing}
          onClick={() => onRemove(record._id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Delete ${record.title}`}
        >
          {removing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <LockKeyhole size={12} className="text-primary" />
          Secure record
        </div>

        <span className="flex items-center gap-1 text-[10px] font-semibold text-primary opacity-70 transition group-hover:opacity-100">
          Open document
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>

      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />

      <span className="absolute right-4 top-4 text-[9px] font-bold text-slate-200">
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}

function UploadField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function HealthVault() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("other");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      const { data } = await api.get("/health-records");
      setRecords(data.records || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load your health records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("recordType", recordType);
      formData.append("notes", notes);

      await api.post("/health-records", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setTitle("");
      setRecordType("other");
      setNotes("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    setError("");
    setRemovingId(id);

    try {
      await api.delete(`/health-records/${id}`);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't delete this document."
      );
    } finally {
      setRemovingId(null);
    }
  }

  function closeForm() {
    setShowForm(false);
    setFile(null);
    setTitle("");
    setRecordType("other");
    setNotes("");
    setError("");
  }

  return (
    <div className="vault-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .vault-page {
          background:
            radial-gradient(circle at 8% 7%, rgba(15,110,91,.08), transparent 28rem),
            radial-gradient(circle at 92% 28%, rgba(16,185,129,.055), transparent 26rem),
            #f4f9f6;
        }

        .vault-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .36;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .vault-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.05);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .vault-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.7rem 0 100%;
        }

        .vault-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.7rem;
          background: rgba(15,110,91,.035);
        }

        .vault-card:hover .vault-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.7rem;
        }

        .vault-promo::after {
          content: "";
          position: absolute;
          left: -30%;
          top: -30%;
          width: 16%;
          height: 180%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.20),
            transparent
          );
          animation: vault-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .upload-zone {
          position: relative;
          overflow: hidden;
        }

        .upload-zone::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 10%, rgba(15,110,91,.06), transparent 10rem),
            radial-gradient(circle at 85% 90%, rgba(16,185,129,.05), transparent 10rem);
          pointer-events: none;
        }

        .upload-zone:hover .upload-icon {
          transform: translateY(-3px) scale(1.06) rotate(-4deg);
        }

        .upload-icon {
          transition: transform .45s cubic-bezier(.22,1,.36,1);
        }

        .vault-file-input {
          position: absolute;
          inset: 0;
          cursor: pointer;
          opacity: 0;
        }

        @keyframes vault-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vault-promo::after {
            animation: none;
          }

          .vault-card .vault-corner,
          .upload-icon {
            transition: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_20px_70px_rgba(15,23,42,.065)] backdrop-blur-2xl sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-primary" />
                Private health vault
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                <BadgeCheck size={11} />
                Your records
              </span>
            </div>

            <p className="eyebrow mt-7">Health vault</p>

            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
              Every important document,
              <span className="block text-primary">
                in one secure place.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep lab reports, prescriptions, vaccination cards, imaging
              documents, and insurance records organized and easy to access.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="vault-primary group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
              >
                <span className="absolute inset-y-0 -left-10 w-7 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[120%]" />
                <Plus size={16} />
                Upload a document
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-3 text-[10px] font-semibold text-slate-500">
                <FolderOpen size={13} className="text-primary" />
                {records.length} saved{" "}
                {records.length === 1 ? "record" : "records"}
              </div>
            </div>
          </div>

          {/* Promo */}
          <aside className="vault-promo group relative min-h-[300px] overflow-hidden rounded-[2rem] shadow-[0_25px_75px_rgba(15,23,42,.12)]">
            <img
              src={VAULT_PROMO_IMAGE}
              alt="Healthcare professional working with medical records"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] backdrop-blur-md">
                  KapHealth records
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <LockKeyhole size={16} />
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  Stay organized
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Carry your records with you.
                </h2>

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Keep essential healthcare documents ready for your next
                  consultation.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* Upload form */}
        {showForm && (
          <section className="upload-zone mt-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_70px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-7">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">New health record</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Upload document
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  PDF, JPG, JPEG, and PNG files are supported.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close upload form"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="relative z-10 mt-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <label className="group relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-white/55 p-6 text-center transition hover:border-primary/40 hover:bg-primary/[0.025]">
                  <input
                    className="vault-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0] && !title) {
                        setTitle(e.target.files[0].name);
                      }
                    }}
                    required
                  />

                  <span className="upload-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Upload size={22} />
                  </span>

                  <span className="mt-4 text-sm font-semibold text-slate-800">
                    {file ? file.name : "Choose a document"}
                  </span>

                  <span className="mt-1 text-[10px] text-slate-400">
                    {file
                      ? `${Math.max(1, Math.round(file.size / 1024))} KB selected`
                      : "Click anywhere in this area to browse"}
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <UploadField label="Document title">
                    <input
                      className="input h-12 sm:col-span-2"
                      placeholder="e.g. Blood test report"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </UploadField>

                  <UploadField label="Record type">
                    <select
                      className="input h-12"
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                    >
                      {Object.entries(TYPE_LABEL).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </UploadField>

                  <UploadField label="Notes">
                    <textarea
                      className="input min-h-[100px] resize-none"
                      rows={3}
                      placeholder="Optional context..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </UploadField>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload record
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Records */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your documents</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Health records
              </h2>
            </div>

            {!loading && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                {records.length}{" "}
                {records.length === 1 ? "document" : "documents"}
              </span>
            )}
          </div>

          {error && !showForm && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[175px] animate-pulse rounded-[1.7rem] border border-slate-200 bg-white/60"
                />
              ))}
            </div>
          ) : records.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {records.map((record, index) => (
                <DocumentCard
                  key={record._id}
                  record={record}
                  index={index}
                  onRemove={remove}
                  removing={removingId === record._id}
                />
              ))}
            </div>
          ) : !showForm ? (
            <div className="mt-4 rounded-[2rem] border border-dashed border-slate-300 bg-white/55 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText size={28} strokeWidth={1.6} />
              </div>

              <p className="eyebrow mt-5">Your vault is ready</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                No documents uploaded yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first health record so important medical documents
                are available when you need them.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-secondary mt-5"
              >
                <Plus size={15} />
                Upload first document
              </button>
            </div>
          ) : null}
        </section>

        {/* Security footer */}
        <section className="mt-7 rounded-[2rem] border border-white/80 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Your records stay connected to your KapHealth account.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-400">
                Keep documents available for future consultations and
                healthcare journeys.
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700">
              <ShieldCheck size={11} />
              Private vault
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
