import { useEffect, useState } from "react";
import { FileText, Upload, Trash2, X } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TYPE_LABEL = {
  lab_report: "Lab report", prescription: "Prescription", vaccination: "Vaccination",
  discharge_summary: "Discharge summary", insurance: "Insurance", scan_imaging: "Scan / imaging", other: "Other",
};

export default function HealthVault() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("other");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.get("/health-records").then(({ data }) => setRecords(data.records));
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    if (!file) return setError("Choose a file to upload.");
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("recordType", recordType);
      formData.append("notes", notes);
      await api.post("/health-records", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setTitle("");
      setNotes("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    await api.delete(`/health-records/${id}`);
    load();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Health vault</p>
        <h1 className="font-display text-2xl font-medium">Your health records</h1>
        <p className="mt-2 text-sm text-muted">Keep lab reports, prescriptions, vaccination cards and more in one place.</p>

        <div className="mt-6 space-y-3">
          {records.map((r) => (
            <div key={r._id} className="card flex items-center justify-between p-4">
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted">{TYPE_LABEL[r.recordType]} · {new Date(r.recordDate).toLocaleDateString()}{r.forDependentName ? ` · ${r.forDependentName}` : ""}</p>
                </div>
              </a>
              <button onClick={() => remove(r._id)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
          {records.length === 0 && !showForm && (
            <div className="card p-8 text-center">
              <FileText size={28} className="mx-auto text-muted" />
              <p className="mt-3 text-sm text-muted">No documents uploaded yet.</p>
            </div>
          )}
        </div>

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 w-full">
            <Upload size={16} /> Upload a document
          </button>
        ) : (
          <form onSubmit={submit} className="card mt-4 space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">Upload document</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted" /></button>
            </div>
            <input className="input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} required />
            <input className="input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="input" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
              {Object.entries(TYPE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
            <textarea className="input" rows={2} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={uploading} className="btn-primary w-full">{uploading ? "Uploading..." : "Upload"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
