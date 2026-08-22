import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useElapsedTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    if (!startRef.current) startRef.current = Date.now();
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [active]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function VideoCallStage({
  localVideoRef,
  remoteVideoRef,
  remoteJoined,
  onHangUp,
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const elapsed = useElapsedTimer(remoteJoined);

  function toggleTrack(kind, setter) {
    const stream = localVideoRef.current?.srcObject;

    stream?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => {
        track.enabled = !track.enabled;
      });

    setter((prev) => !prev);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">

      {/* Header */}

      <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-5 py-4">

        <div>

          <h2 className="font-semibold text-white">
            Secure Video Consultation
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> 256-bit encrypted</span>
            <span className="flex items-center gap-1"><Wifi size={12} /> WebRTC HD</span>
            {remoteJoined && <span className="font-mono">{elapsed}</span>}
          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">

          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

          {remoteJoined ? "Connected" : "Waiting..."}

        </div>

      </div>

      {/* Remote Video */}

      <div className="relative flex-1 bg-black">

        {remoteJoined ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-white">

            <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-5xl">
              👨‍⚕️
            </div>

            <h2 className="text-xl font-semibold">
              Waiting for Doctor
            </h2>

            <p className="mt-2 max-w-sm text-sm text-white/60">
              The consultation will begin automatically once the doctor joins.
            </p>

          </div>
        )}

        {/* Local Video */}

        <div className="absolute bottom-6 right-6 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="h-40 w-28 bg-slate-900 object-cover sm:h-48 sm:w-36"
          />

        </div>

      </div>

      {/* Controls */}

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/60 px-6 py-3 backdrop-blur-xl">

        <button
          onClick={() => toggleTrack("audio", setMicOn)}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            micOn
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-500 text-white"
          }`}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={() => toggleTrack("video", setCamOn)}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            camOn
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-500 text-white"
          }`}
        >
          {camOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          onClick={onHangUp}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white transition-all duration-300 hover:scale-110 hover:bg-red-700"
        >
          <PhoneOff size={22} />
        </button>

      </div>
    </div>
  );
}