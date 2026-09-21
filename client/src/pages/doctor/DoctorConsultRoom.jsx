import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
  Video,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import VideoCallStage from "../../components/VideoCallStage.jsx";
import ChatBox from "../../components/ChatBox.jsx";
import { useVideoCall } from "../../hooks/useVideoCall.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../services/api.js";
import api from "../../services/api.js";

const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  durationDays: 5,
  instructions: "",
});

const PATIENT_AVATAR =
  "https://api.dicebear.com/9.x/initials/svg?seed=Patient";

function SectionTitle({ eyebrow, title, icon: Icon }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={16} />
        </div>
      )}
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={12} className="text-primary" />
        <span className="text-[8px] font-bold uppercase tracking-[.13em]">
          {label}
        </span>
      </div>
      <p className="mt-1.5 truncate text-xs font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function PrescriptionMedicine({ medicine, index, onChange, onRemove }) {
  return (
    <div className="rx-medicine-card group rounded-[1.35rem] border border-slate-200/75 bg-white/55 p-4 transition hover:bg-white/80 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-[9px] font-bold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
            Medicine
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove medicine ${index + 1}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Medicine name</span>
          <input
            className="input rx-input"
            placeholder="e.g. Paracetamol"
            value={medicine.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="label">Dosage</span>
          <input
            className="input rx-input"
            placeholder="e.g. 500mg"
            value={medicine.dosage}
            onChange={(e) => onChange("dosage", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="label">Frequency</span>
          <input
            className="input rx-input"
            placeholder="e.g. 1-0-1"
            value={medicine.frequency}
            onChange={(e) => onChange("frequency", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="label">Duration (days)</span>
          <input
            className="input rx-input"
            type="number"
            min="1"
            value={medicine.durationDays}
            onChange={(e) =>
              onChange("durationDays", Number(e.target.value))
            }
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="label">Instructions</span>
        <input
          className="input rx-input"
          placeholder="e.g. After food, morning & evening"
          value={medicine.instructions}
          onChange={(e) => onChange("instructions", e.target.value)}
        />
      </label>
    </div>
  );
}

export default function DoctorConsultRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [roomAccess, setRoomAccess] = useState(null);
  const [showRx, setShowRx] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notesForPatient, setNotesForPatient] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [showPatientSummary, setShowPatientSummary] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      setLoadingRoom(true);
      setError("");

      try {
        const [appointmentResponse, roomResponse] = await Promise.all([
          api.get(`/appointments/${id}`),
          api.get(`/appointments/${id}/room-access`),
        ]);

        if (!mounted) return;

        setAppointment(appointmentResponse.data.appointment);
        setRoomAccess(roomResponse.data);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load the consultation room."
          );
        }
      } finally {
        if (mounted) setLoadingRoom(false);
      }
    }

    loadRoom();

    return () => {
      mounted = false;
    };
  }, [id]);

  const {
    localVideoRef,
    remoteVideoRef,
    remoteJoined,
    messages,
    sendMessage,
    hangUp,
  } = useVideoCall({
    roomId: roomAccess?.roomId,
    accessToken: getAccessToken(),
    iceServers: roomAccess?.iceServers,
  });

  function updateMedicine(index, field, value) {
    setMedicines((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addMedicine() {
    setMedicines((items) => [...items, emptyMedicine()]);
  }

  function removeMedicine(index) {
    setMedicines((items) =>
      items.length === 1
        ? [emptyMedicine()]
        : items.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function issuePrescription(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const validMedicines = medicines.filter(
      (medicine) =>
        medicine.name && medicine.dosage && medicine.frequency
    );

    try {
      await api.post(`/prescriptions/appointment/${id}`, {
        diagnosis,
        notesForPatient,
        medicines: validMedicines,
      });

      hangUp();
      await api.post(`/appointments/${id}/end-call`).catch(() => {});
      navigate("/doctor/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't issue the prescription."
      );
    } finally {
      setSaving(false);
    }
  }

  async function endWithoutRx() {
    try {
      hangUp();
      await api.post(`/appointments/${id}/end-call`);
      navigate("/doctor/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't end the consultation."
      );
    }
  }

  const patientName =
    appointment?.patient?.name || "Patient";

  const connected = remoteJoined;

  const consultationStatus = connected
    ? "Live consultation"
    : "Waiting for patient";

  const validMedicineCount = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.name &&
          medicine.dosage &&
          medicine.frequency
      ).length,
    [medicines]
  );

  if (loadingRoom && !appointment) {
    return (
      <div className="consult-page min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-sm backdrop-blur-xl">
            <div className="h-4 w-36 rounded-full bg-slate-200" />
            <div className="mt-3 h-9 w-72 rounded-xl bg-slate-200" />
            <div className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
              <div className="h-[600px] rounded-[1.8rem] bg-slate-200/70" />
              <div className="h-[600px] rounded-[1.8rem] bg-slate-200/70" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="consult-page min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-6">
          <div className="rounded-[2rem] border border-white/80 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </div>

            <p className="eyebrow mt-5">Consultation unavailable</p>

            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              Couldn't open this room.
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Please return to the doctor dashboard and try again."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/doctor/dashboard")}
              className="btn-primary mt-6 inline-flex"
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="consult-page relative min-h-screen overflow-hidden bg-[#f4f9f6] pb-8">
      <Navbar />

      <style>{`
        .consult-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 31rem),
            radial-gradient(circle at 94% 24%, rgba(16,185,129,.05), transparent 29rem),
            #f4f9f6;
        }

        .consult-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .30;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .consult-shell {
          position: relative;
          overflow: hidden;
        }

        .consult-shell::before,
        .consult-shell::after {
          content: "";
          position: absolute;
          width: 14%;
          height: 14%;
          pointer-events: none;
          background: rgba(15,110,91,.035);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .consult-shell::before {
          right: 0;
          top: 0;
          border-radius: 0 2rem 0 100%;
        }

        .consult-shell::after {
          left: 0;
          bottom: 0;
          border-radius: 0 100% 0 2rem;
        }

        .consult-shell:hover::before,
        .consult-shell:hover::after {
          width: 40%;
          height: 40%;
          border-radius: 2rem;
        }

        .consult-action {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .consult-action::after {
          content: "";
          position: absolute;
          left: -35%;
          top: -50%;
          width: 16%;
          height: 200%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.24), transparent);
          transition: left .7s ease;
          pointer-events: none;
          z-index: -1;
        }

        .consult-action:hover::after {
          left: 130%;
        }

        .patient-panel {
          position: relative;
          overflow: hidden;
        }

        .patient-panel::after {
          content: "";
          position: absolute;
          right: -35px;
          top: -35px;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: rgba(15,110,91,.07);
          filter: blur(7px);
          pointer-events: none;
        }

        .rx-input {
          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .rx-input:hover {
          border-color: rgba(15,110,91,.25);
          background: rgba(255,255,255,.9);
        }

        .rx-input:focus {
          border-color: rgba(15,110,91,.45);
          box-shadow: 0 0 0 4px rgba(15,110,91,.08);
          background: white;
        }

        .rx-medicine-card {
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            background .3s ease;
        }

        .rx-medicine-card:hover {
          transform: translateY(-1px);
        }

        .consult-rx-modal {
          animation: consult-modal-in .25s cubic-bezier(.22,1,.36,1);
        }

        @keyframes consult-modal-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .consult-shell::before,
          .consult-shell::after,
          .consult-action::after,
          .rx-medicine-card,
          .consult-rx-modal {
            transition: none !important;
            animation: none !important;
          }

          .rx-medicine-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Top workspace bar */}
        <section className="consult-shell rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-6">
          <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/doctor/dashboard")}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-400 transition hover:-translate-x-0.5 hover:text-primary"
                aria-label="Back to doctor dashboard"
              >
                <ArrowLeft size={15} />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[9px] font-semibold text-slate-600 shadow-sm">
                    <Stethoscope size={12} className="text-primary" />
                    Doctor consultation room
                  </span>

                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em]",
                      connected
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        connected
                          ? "animate-pulse bg-emerald-500"
                          : "bg-amber-500",
                      ].join(" ")}
                    />
                    {consultationStatus}
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Consultation with {patientName}
                </h1>

                <p className="mt-1 text-xs text-slate-400">
                  Secure clinical workspace · Appointment #{id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/65 px-3 py-2 text-[9px] font-semibold text-slate-500">
                <LockKeyhole size={11} className="text-primary" />
                Encrypted room
              </span>

              <button
                type="button"
                onClick={() => setShowPatientSummary((value) => !value)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/65 px-3 py-2 text-[9px] font-bold text-slate-600 transition hover:border-primary/20 hover:text-primary"
              >
                <UserRound size={12} />
                {showPatientSummary ? "Hide patient info" : "Show patient info"}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.38fr)_minmax(330px,.62fr)]">
          {/* Video + consultation actions */}
          <div className="space-y-4">
            {showPatientSummary && (
              <section className="patient-panel rounded-[1.8rem] border border-white/80 bg-white/65 p-4 shadow-[0_18px_55px_rgba(15,23,42,.06)] backdrop-blur-xl">
                <div className="relative z-10 grid gap-3 sm:grid-cols-3">
                  <InfoChip
                    icon={UserRound}
                    label="Patient"
                    value={patientName}
                  />
                  <InfoChip
                    icon={HeartPulse}
                    label="Consultation"
                    value={
                      appointment.reasonForVisit ||
                      "General consultation"
                    }
                  />
                  <InfoChip
                    icon={BadgeCheck}
                    label="Status"
                    value={appointment.status?.replace(/_/g, " ")}
                  />
                </div>
              </section>
            )}

            <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_90px_rgba(15,23,42,.16)]">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.08),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,.08),transparent_32%)]" />

              <div className="relative z-10 min-h-[560px] p-2 sm:p-3">
                <VideoCallStage
                  localVideoRef={localVideoRef}
                  remoteVideoRef={remoteVideoRef}
                  remoteJoined={remoteJoined}
                  onHangUp={endWithoutRx}
                />
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-white/80 bg-white/65 p-4 shadow-[0_20px_60px_rgba(15,23,42,.06)] backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileSignature size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Finish the consultation with an e-prescription
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      Review the patient discussion, document the diagnosis,
                      and issue medicines before ending the room.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRx(true)}
                  className="consult-action inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-[.11em] text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  <FileSignature size={13} />
                  Issue e-prescription
                </button>
              </div>
            </section>
          </div>

          {/* Chat + clinical context */}
          <aside className="flex min-h-[680px] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl">
            <div className="border-b border-slate-200/70 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageCircle size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">
                      Live notes
                    </p>
                    <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
                      Consultation chat
                    </h2>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.1em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <InfoChip
                  icon={Activity}
                  label="Room"
                  value={roomAccess?.roomId || "Secured"}
                />
                <InfoChip
                  icon={Video}
                  label="Connection"
                  value={connected ? "Connected" : "Waiting"}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatBox
                messages={messages}
                onSend={sendMessage}
                myUserId={user?.id}
              />
            </div>
          </aside>
        </div>

        {/* Consultation footer */}
        <section className="mt-5 flex flex-col justify-between gap-3 rounded-[1.8rem] border border-white/80 bg-white/60 px-5 py-4 text-[9px] text-slate-400 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
              <ShieldCheck size={11} className="text-primary" />
              Clinical workspace
            </span>
            <span>·</span>
            <span>Patient: {patientName}</span>
            <span>·</span>
            <span>
              Prescription entries: {validMedicineCount}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole size={10} />
            End the consultation only when your clinical workflow is complete.
          </span>
        </section>
      </main>

      {/* Prescription modal */}
      {showRx && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-md sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowRx(false);
            }
          }}
        >
          <form
            onSubmit={issuePrescription}
            className="consult-rx-modal flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-[#f7fbf8]/95 shadow-[0_40px_120px_rgba(15,23,42,.22)] backdrop-blur-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/75 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill inline-flex items-center gap-1.5">
                      <FileSignature size={13} className="text-primary" />
                      E-prescription
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.11em] text-emerald-700">
                      Draft
                    </span>
                  </div>

                  <p className="eyebrow mt-5">Clinical documentation</p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Prescribe for {patientName}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Complete the relevant fields, then issue and end the
                    consultation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRx(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 transition hover:text-slate-900"
                  aria-label="Close prescription dialog"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <section className="rounded-[1.5rem] border border-slate-200/75 bg-white/60 p-5">
                <SectionTitle
                  eyebrow="Diagnosis"
                  title="Clinical summary"
                  icon={ClipboardList}
                />

                <label className="mt-5 block">
                  <span className="label">Diagnosis / assessment</span>
                  <input
                    className="input rx-input"
                    placeholder="Enter the diagnosis or assessment..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </label>

                <label className="mt-4 block">
                  <span className="label">Notes for patient</span>
                  <textarea
                    className="input rx-input"
                    rows={4}
                    placeholder="Follow-up instructions, precautions, lifestyle notes..."
                    value={notesForPatient}
                    onChange={(e) =>
                      setNotesForPatient(e.target.value)
                    }
                  />
                </label>
              </section>

              <section className="mt-4 rounded-[1.5rem] border border-slate-200/75 bg-white/60 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Medication plan</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                      Medicines
                    </h3>
                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      Add only the medicines needed for this consultation.
                    </p>
                  </div>

                  <span className="rounded-full bg-primary/[0.06] px-3 py-1.5 text-[9px] font-bold text-primary">
                    {validMedicineCount} ready
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {medicines.map((medicine, index) => (
                    <PrescriptionMedicine
                      key={index}
                      medicine={medicine}
                      index={index}
                      onChange={(field, value) =>
                        updateMedicine(index, field, value)
                      }
                      onRemove={() => removeMedicine(index)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                >
                  <Plus size={13} />
                  Add medicine
                </button>
              </section>

              <section className="mt-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      Ready to issue
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-emerald-700/70">
                      Issuing the prescription ends the consultation and
                      returns you to the doctor dashboard.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t border-slate-200/75 bg-white/55 px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowRx(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-[10px] font-bold text-slate-600 transition hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  className="consult-action inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-[.11em] text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <FileSignature size={13} />
                      Issue & end call
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
