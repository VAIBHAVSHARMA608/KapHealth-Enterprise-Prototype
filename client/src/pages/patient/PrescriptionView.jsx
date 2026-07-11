import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Pill, ShoppingCart } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import PulseDivider from "../../components/PulseDivider.jsx";
import api from "../../services/api.js";

export default function PrescriptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx, setRx] = useState(null);

  useEffect(() => {
    api.get(`/prescriptions/${id}`).then(({ data }) => setRx(data.prescription));
  }, [id]);

  if (!rx) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading prescription...</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">e-Prescription</p>
        <h1 className="font-display text-2xl font-medium">Issued {new Date(rx.signedAt).toLocaleDateString()}</h1>

        <div className="card mt-6 p-6">
          {rx.diagnosis && (
            <div className="mb-4">
              <p className="label">Diagnosis</p>
              <p className="text-sm">{rx.diagnosis}</p>
            </div>
          )}
          <PulseDivider className="mb-4 opacity-40" />
          <p className="label mb-2">Medicines</p>
          <div className="space-y-3">
            {rx.medicines.map((m, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-black/[0.02] p-3">
                <Pill className="mt-0.5 shrink-0 text-primary" size={16} />
                <div>
                  <p className="text-sm font-semibold">{m.name} — {m.dosage}</p>
                  <p className="font-mono text-xs text-muted">{m.frequency} · {m.durationDays} days{m.instructions ? ` · ${m.instructions}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
          {rx.notesForPatient && (
            <div className="mt-4">
              <p className="label">Notes</p>
              <p className="text-sm">{rx.notesForPatient}</p>
            </div>
          )}
          {rx.followUpDate && (
            <p className="mt-4 text-sm text-muted">Follow-up recommended: {new Date(rx.followUpDate).toLocaleDateString()}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {rx.pdfUrl && (
            <a href={rx.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary flex-1">
              <Download size={16} /> Download PDF
            </a>
          )}
          <button
            disabled={rx.isOrdered}
            onClick={() => navigate(`/patient/order/${rx._id}`)}
            className="btn-primary flex-1"
          >
            <ShoppingCart size={16} /> {rx.isOrdered ? "Already ordered" : "Order medicines"}
          </button>
        </div>
      </div>
    </div>
  );
}
