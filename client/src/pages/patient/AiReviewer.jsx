import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Sparkles,
  Trash2,
  Upload,
  User,
  Utensils,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TYPE_META = {
  physique: {
    label: "Physique",
    title: "Understand your physique.",
    description:
      "Upload a clear photo and add your goal. KapHealth will organize the review into observations and practical next steps.",
    icon: User,
    accent: "from-[#0F6E5B] to-[#0A4F42]",
    soft: "bg-emerald-50 text-emerald-700",
    placeholder: "Optional: your goal (e.g. lean bulk, fat loss)...",
    tips: [
      "Use a well-lit, clear photo",
      "Keep your full posture visible",
      "Add your goal for better context",
    ],
  },
  diet: {
    label: "Meal / Diet",
    title: "Make better food choices.",
    description:
      "Upload a meal photo and tell us what you're eating. Your review is organized around the meal itself and your stated context.",
    icon: Utensils,
    accent: "from-[#176B68] to-[#123F58]",
    soft: "bg-cyan-50 text-cyan-700",
    placeholder: "Optional: what's in this meal?",
    tips: [
      "Capture the full meal",
      "Use natural or bright lighting",
      "Add ingredients or serving context",
    ],
  },
};

function ReviewCard({ review, index }) {
  const image = review.imageUrls?.[0];

  return (
    <div className="group/review aspect-square">
      <div className="flip-card">
        <div className="flip-card-inner">
          {/* Front */}
          <div className="flip-card-front">
            <div className="relative h-full w-full overflow-hidden rounded-[1.25rem]">
              {image ? (
                <img
                  src={image}
                  alt="Past AI review"
                  className="h-full w-full object-cover transition duration-700 group-hover/review:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                  <ImagePlus size={22} />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

              <div className="absolute inset-x-3 bottom-3">
                <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                  Review {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back">
            <div className="h-full w-full rounded-[1.25rem] bg-gradient-to-br from-[#0F6E5B] to-[#083F37] p-4 text-white">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <Sparkles size={15} />
                  </span>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    AI Review
                  </span>
                </div>

                <div className="mt-auto">
                  <p className="flex items-center gap-1.5 text-[10px] text-white/45">
                    <Clock3 size={11} />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-2 line-clamp-4 text-xs leading-5 text-white/75">
                    {review.result?.summary ||
                      "Review details are available in your saved analysis."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiReviewer() {
  const [type, setType] = useState("physique");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const meta = TYPE_META[type];
  const TypeIcon = meta.icon;

  function clearPreviews() {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
  }

  async function loadHistory(currentType) {
    setLoadingHistory(true);

    try {
      const { data } = await api.get("/wellness/ai-review", {
        params: { type: currentType },
      });

      setHistory(data.reviews || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory(type);
    setResult(null);
    setFiles([]);
    clearPreviews();

    return () => {
      // Blob URLs are also released when the type changes/unmounts.
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // previews intentionally omitted: this effect is only for type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function onFilesSelected(e) {
    const selected = Array.from(e.target.files || []).slice(0, 3);

    if (!selected.length) return;

    clearPreviews();
    setFiles(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
    setError("");
  }

  function removeFile(index) {
    setFiles((items) => items.filter((_, i) => i !== index));

    setPreviews((items) => {
      const next = [...items];
      const [removed] = next.splice(index, 1);

      if (removed) URL.revokeObjectURL(removed);

      return next;
    });
  }

  async function submit() {
    if (files.length === 0) {
      setError("Add at least one photo first.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("notes", notes);
      files.forEach((file) => formData.append("photos", file));

      const { data } = await api.post(
        "/wellness/ai-review",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResult(data.review);
      setFiles([]);
      clearPreviews();
      setNotes("");
      await loadHistory(type);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't submit for review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wellness-surface relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-24 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-56 top-[35%] h-[36rem] w-[36rem] rounded-full bg-accent/[0.06] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_18px_55px_rgba(15,23,42,0.065)] backdrop-blur-2xl sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="glass-pill">
                  <Sparkles size={13} className="text-primary" />
                  AI wellness studio
                </div>

                <p className="eyebrow mt-6 flex items-center gap-2">
                  <Sparkles size={13} />
                  AI reviewer
                </p>

                <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Better context for
                  <span className="block text-primary">
                    better wellness decisions.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Upload a photo, choose the kind of review you need, and
                  keep every analysis in one polished wellness workspace.
                </p>
              </div>

              <div
                className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.soft} sm:flex`}
              >
                <TypeIcon size={24} strokeWidth={1.7} />
              </div>
            </div>

            {/* Role/type selector */}
            <div className="mt-7 flex w-full max-w-md rounded-2xl border border-slate-200/80 bg-slate-100/75 p-1">
              {[
                ["physique", User, "Physique"],
                ["diet", Utensils, "Meal / Diet"],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={[
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-300",
                    type === key
                      ? "bg-white text-primary shadow-sm ring-1 ring-black/[0.03]"
                      : "text-slate-500 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Side guidance card */}
          <div
            className={[
              "relative overflow-hidden rounded-[2rem] border border-white/10 p-7 text-white shadow-[0_18px_55px_rgba(15,23,42,0.12)]",
              `bg-gradient-to-br ${meta.accent}`,
            ].join(" ")}
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:18px_18px]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl">
                  <TypeIcon size={18} />
                </span>

                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-white/55">
                  {meta.label}
                </span>
              </div>

              <h2 className="mt-8 text-2xl font-semibold tracking-tight">
                {meta.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/55">
                {meta.description}
              </p>

              <div className="mt-6 space-y-3">
                {meta.tips.map((tip) => (
                  <div
                    key={tip}
                    className="flex items-start gap-2.5 text-xs text-white/70"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-200"
                    />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main reviewer */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="glass-card p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Preview analysis
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  This prototype currently uses placeholder AI verdict text.
                  Uploads and review history are real; production vision
                  inference can replace the analysis layer later.
                </p>
              </div>
            </div>

            {/* Upload area */}
            <div className="mt-6 rounded-[1.6rem] border border-slate-200/80 bg-white/55 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {previews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/70 bg-slate-100 shadow-sm"
                  >
                    <img
                      src={src}
                      alt={`Selected upload ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75">
                        Photo {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition hover:bg-red-500 group-hover:opacity-100"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {previews.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white/45 text-slate-400 transition hover:border-primary/40 hover:bg-primary/[0.025] hover:text-primary"
                  >
                    <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-[5]" />

                    <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition group-hover:bg-primary/10 group-hover:text-primary">
                      <Upload size={20} />
                    </span>

                    <span className="relative mt-3 text-xs font-semibold">
                      Add photo
                    </span>
                    <span className="relative mt-1 text-[10px] text-slate-400">
                      Up to 3 images
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Upload controls */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="btn-secondary !py-2.5 text-xs"
              >
                <Camera size={14} />
                Use camera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary !py-2.5 text-xs"
              >
                <Upload size={14} />
                Upload from device
              </button>

              {files.length > 0 && (
                <span className="ml-auto flex items-center gap-1.5 self-center text-[10px] font-medium text-slate-400">
                  <ImagePlus size={12} />
                  {files.length} / 3 selected
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFilesSelected}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={onFilesSelected}
            />

            {/* Notes */}
            <div className="mt-5">
              <label className="label" htmlFor="review-notes">
                Context
              </label>

              <textarea
                id="review-notes"
                className="input min-h-[105px] resize-y"
                rows={3}
                placeholder={meta.placeholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn-primary group mt-4 w-full py-3.5"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Preparing review...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Get AI review
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>

          {/* Result */}
          <aside className="space-y-5">
            {result ? (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <span className="glass-pill">
                    <Sparkles size={12} className="text-primary" />
                    Review ready
                  </span>

                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close review result"
                  >
                    <X size={15} />
                  </button>
                </div>

                <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                  Your review
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {result.result.summary}
                </p>

                {result.result.observations?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Observations
                    </p>

                    <ul className="mt-2 space-y-2">
                      {result.result.observations.map((observation) => (
                        <li
                          key={observation}
                          className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {observation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.result.suggestions?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Suggestions
                    </p>

                    <ul className="mt-2 space-y-2">
                      {result.result.suggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                        >
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[10px] leading-5 text-slate-400">
                    {result.result.disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-card min-h-[300px] p-6">
                <div className="flex h-full flex-col justify-center text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={21} />
                  </div>

                  <h2 className="mt-4 text-sm font-semibold text-slate-800">
                    Your analysis will appear here
                  </h2>

                  <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
                    Add an image and some context, then start the review.
                  </p>
                </div>
              </div>
            )}

            {/* History */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">History</p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    Past {meta.label.toLowerCase()} reviews
                  </h3>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500">
                  {history.length}
                </span>
              </div>

              {loadingHistory ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="aspect-square animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : history.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {history.map((review, index) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-7 text-center">
                  <p className="text-xs font-semibold text-slate-600">
                    No reviews yet
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Completed reviews will appear here.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
