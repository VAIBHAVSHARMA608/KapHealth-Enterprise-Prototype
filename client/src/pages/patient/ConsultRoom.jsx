import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileText } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import VideoCallStage from "../../components/VideoCallStage.jsx";
import ChatBox from "../../components/ChatBox.jsx";
import { useVideoCall } from "../../hooks/useVideoCall.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../services/api.js";
import api from "../../services/api.js";

export default function ConsultRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [roomAccess, setRoomAccess] = useState(null);

  useEffect(() => {
    api.get(`/appointments/${id}`).then(({ data }) => setAppointment(data.appointment));
    api.get(`/appointments/${id}/room-access`).then(({ data }) => setRoomAccess(data));
  }, [id]);

  const { localVideoRef, remoteVideoRef, remoteJoined, messages, sendMessage, hangUp, callEnded } = useVideoCall({
    roomId: roomAccess?.roomId,
    accessToken: getAccessToken(),
    iceServers: roomAccess?.iceServers,
  });

  async function endCall() {
    hangUp();
    await api.post(`/appointments/${id}/end-call`);
    navigate(`/patient/appointments/${id}`);
  }

  if (!appointment) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading room...</p></div>;

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-6 py-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <VideoCallStage localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} remoteJoined={remoteJoined} onHangUp={endCall} />
        </div>
        <div className="card flex flex-col overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">Consult with Dr. {appointment.doctor.name}</p>
            <p className="text-xs text-muted">Chat stays saved to this appointment</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatBox messages={messages} onSend={sendMessage} myUserId={user?.id} />
          </div>
        </div>
      </div>

      {callEnded && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6">
          <div className="card max-w-sm p-6 text-center">
            <FileText className="mx-auto mb-3 text-primary" size={32} />
            <h2 className="font-display text-lg font-medium">Call ended</h2>
            <p className="mt-1 text-sm text-muted">Your doctor will issue an e-prescription shortly, if needed.</p>
            <Link to={`/patient/appointments/${id}`} className="btn-primary mt-5 w-full">View appointment</Link>
          </div>
        </div>
      )}
    </div>
  );
}
