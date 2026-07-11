import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useState } from "react";

export default function VideoCallStage({ localVideoRef, remoteVideoRef, remoteJoined, onHangUp }) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  function toggleTrack(kind, setter) {
    const stream = localVideoRef.current?.srcObject;
    stream?.getTracks().filter((t) => t.kind === kind).forEach((t) => (t.enabled = !t.enabled));
    setter((v) => !v);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl2 bg-ink">
      <div className="relative flex-1">
        {remoteJoined ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            Waiting for the other participant to join...
          </div>
        )}
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 h-32 w-24 rounded-lg border-2 border-white/20 object-cover shadow-lg sm:h-40 sm:w-32" />
      </div>
      <div className="flex items-center justify-center gap-3 bg-black/40 py-4">
        <button onClick={() => toggleTrack("audio", setMicOn)} className={`flex h-11 w-11 items-center justify-center rounded-full ${micOn ? "bg-white/15 text-white" : "bg-white text-ink"}`}>
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button onClick={() => toggleTrack("video", setCamOn)} className={`flex h-11 w-11 items-center justify-center rounded-full ${camOn ? "bg-white/15 text-white" : "bg-white text-ink"}`}>
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button onClick={onHangUp} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
