import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Sparkles, User, Utensils, X, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

export default function AiReviewer() {
  const [type, setType] = useState("physique");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  function loadHistory(t) {
    api.get("/wellness/ai-review", { params: { type: t } }).then(({ data }) => setHistory(data.reviews));
  }

  useEffect(() => {
    loadHistory(type);
    setResult(null);
    setFiles([]);
    setPreviews([]);
  }, [type]);

  function onFilesSelected(e) {
    const selected = Array.from(e.target.files || []).slice(0, 3);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(idx) {
    setFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (files.length === 0) return setError("Add at least one photo first.");
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("notes", notes);
      files.forEach((f) => formData.append("photos", f));
      const { data } = await api.post("/wellness/ai-review", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(data.review);
      setFiles([]);
      setPreviews([]);
      setNotes("");
      loadHistory(type);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit for review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wellness-surface">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow mb-2 flex items-center gap-2"><Sparkles size={14} /> AI Reviewer</p>
        <h1 className="font-display text-3xl font-medium text-ink">AI physique & diet reviewer</h1>
        <p className="mt-2 text-sm text-ink/65">Upload a photo and get instant feedback.</p>

        <div className="mt-4 flex gap-2 rounded-full bg-white/50 p-1 backdrop-blur-md w-fit">
          <button onClick={() => setType("physique")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${type === "physique" ? "bg-primary text-white shadow" : "text-ink/60"}`}>
            <User size={15} /> Physique
          </button>
          <button onClick={() => setType("diet")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${type === "diet" ? "bg-primary text-white shadow" : "text-ink/60"}`}>
            <Utensils size={15} /> Meal / Diet
          </button>
        </div>

        <div className="glass-card mt-6 p-6">
          <div className="flex items-start gap-2 rounded-2xl border border-status-pending/30 bg-status-pending/10 p-3 text-xs text-status-pending backdrop-blur-md">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>This is a placeholder analysis -- the real AI vision model is coming soon. Uploads and history are fully real, the verdict text is a stand-in.</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button onClick={() => removeFile(i)} className="absolute right-1.5 top-1.5 rounded-full bg-ink/60 p-1 text-white opacity-0 transition group-hover:opacity-100"><X size={12} /></button>
              </div>
            ))}
            {previews.length < 3 && (
              <button onClick={() => fileInputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/15 text-ink/40 transition hover:border-primary/40 hover:text-primary">
                <Upload size={20} />
                <span className="text-[11px]">Upload</span>
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => cameraInputRef.current?.click()} className="btn-secondary !py-2 text-xs"><Camera size={14} /> Use camera</button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary !py-2 text-xs"><Upload size={14} /> Upload from device</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFilesSelected} />

          <textarea
            className="input mt-4"
            rows={2}
            placeholder={type === "physique" ? "Optional: your goal (e.g. lean bulk, fat loss)..." : "Optional: what's in this meal?"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button onClick={submit} disabled={submitting} className="btn-primary mt-4 w-full">
            <Sparkles size={16} /> {submitting ? "Analyzing..." : "Get AI review"}
          </button>
        </div>

        {result && (
          <div className="glass-card mt-6 p-6">
            <span className="glass-pill">Placeholder analysis</span>
            <p className="mt-3 text-sm text-ink/80">{result.result.summary}</p>
            {result.result.observations?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Observations</p>
                <ul className="mt-1.5 space-y-1 text-sm text-ink/75">
                  {result.result.observations.map((o, i) => <li key={i}>• {o}</li>)}
                </ul>
              </div>
            )}
            {result.result.suggestions?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Suggestions</p>
                <ul className="mt-1.5 space-y-1 text-sm text-ink/75">
                  {result.result.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            <p className="mt-4 text-xs italic text-ink/45">{result.result.disclaimer}</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow mb-3">Past reviews</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {history.map((r) => (
                <div key={r._id} className="glass-card overflow-hidden">
                  <img src={r.imageUrls[0]} alt="" className="aspect-square w-full object-cover" />
                  <p className="p-2 text-center text-[10px] text-ink/50">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
