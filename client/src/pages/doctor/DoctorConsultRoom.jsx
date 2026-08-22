import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, FileSignature } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import VideoCallStage from "../../components/VideoCallStage.jsx";
import ChatBox from "../../components/ChatBox.jsx";
import { useVideoCall } from "../../hooks/useVideoCall.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../services/api.js";
import api from "../../services/api.js";

const emptyMedicine = () => ({ name: "", dosage: "", frequency: "", durationDays: 5, instructions: "" });
const FREQUENCY_PRESETS = ["1-0-0", "0-1-0", "0-0-1", "1-0-1", "1-1-1", "0-0-1 at night"];

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

  useEffect(() => {
    api.get(`/appointments/${id}`).then(({ data }) => setAppointment(data.appointment));
    api.get(`/appointments/${id}/room-access`).then(({ data }) => setRoomAccess(data));
  }, [id]);

  const { localVideoRef, remoteVideoRef, remoteJoined, messages, sendMessage, hangUp } = useVideoCall({
    roomId: roomAccess?.roomId,
    accessToken: getAccessToken(),
    iceServers: roomAccess?.iceServers,
  });

  function updateMedicine(i, field, value) {
    setMedicines((ms) => ms.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  async function issuePrescription(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post(`/prescriptions/appointment/${id}`, {
        diagnosis,
        notesForPatient,
        medicines: medicines.filter((m) => m.name && m.dosage && m.frequency),
      });
      hangUp();
      await api.post(`/appointments/${id}/end-call`).catch(() => {});
      navigate("/doctor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't issue prescription.");
    } finally {
      setSaving(false);
    }
  }

  async function endWithoutRx() {
    hangUp();
    await api.post(`/appointments/${id}/end-call`);
    navigate("/doctor/dashboard");
  }

  if (!appointment) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading room...</p></div>;

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 overflow-hidden px-6 py-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <VideoCallStage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} remoteJoined={remoteJoined} onHangUp={endWithoutRx} />
          <button onClick={() => setShowRx(true)} className="btn-primary mt-4 w-full">
            <FileSignature size={16} /> Issue e-prescription
          </button>
        </div>
        <div className="card flex flex-col overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">Consult with {appointment.patient.name}</p>
          </div>
          <div className="flex-1 overflow-hidden"><ChatBox messages={messages} onSend={sendMessage} myUserId={user?.id} /></div>
        </div>
      </div>

      {showRx && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={issuePrescription} className="card max-h-[85vh] w-full max-w-lg overflow-y-auto p-6">
            <h2 className="font-display text-lg font-medium">e-Prescription for {appointment.patient.name}</h2>
            {error && <p className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent backdrop-blur-md">{error}</p>}

            <label className="label mt-4">Diagnosis</label>
            <input className="input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

            <label className="label mt-4">Medicines</label>
            <div className="space-y-3">
              {medicines.map((m, i) => (
                <div key={i} className="rounded-lg border border-line p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input" placeholder="Name" value={m.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} />
                    <input className="input" placeholder="Dosage e.g. 500mg" value={m.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {FREQUENCY_PRESETS.map((f) => (
                      <button
                        type="button"
                        key={f}
                        onClick={() => updateMedicine(i, "frequency", f)}
                        className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${m.frequency === f ? "border-primary bg-primary/15 text-primary-dark" : "border-white/10 bg-white/5 text-muted hover:text-ink"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input className="input" placeholder="Custom frequency" value={m.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} />
                    <input type="number" className="input" placeholder="Duration (days)" value={m.durationDays} onChange={(e) => updateMedicine(i, "durationDays", Number(e.target.value))} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input className="input" placeholder="Instructions (e.g. After food)" value={m.instructions} onChange={(e) => updateMedicine(i, "instructions", e.target.value)} />
                    <button type="button" onClick={() => setMedicines((ms) => ms.filter((_, idx) => idx !== i))} className="shrink-0 text-accent"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setMedicines((ms) => [...ms, emptyMedicine()])} className="btn-ghost mt-2">
              <Plus size={14} /> Add medicine
            </button>

            <label className="label mt-4">Notes for patient</label>
            <textarea className="input" rows={2} value={notesForPatient} onChange={(e) => setNotesForPatient(e.target.value)} />

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowRx(false)} className="btn-secondary flex-1">Cancel</button>
              <button disabled={saving} className="btn-primary flex-1">{saving ? "Issuing..." : "Issue & end call"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
