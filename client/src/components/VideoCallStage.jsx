import {
  Maximize2,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Signal,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function VideoCallStage({
  localVideoRef,
  remoteVideoRef,
  remoteJoined,
  onHangUp,
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const stageRef = useRef(null);

  function toggleTrack(kind, setter) {
    const stream = localVideoRef.current?.srcObject;

    stream
      ?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => {
        track.enabled = !track.enabled;
      });

    setter((prev) => !prev);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen can be blocked by the browser or embedding context.
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <section
      ref={stageRef}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={[
        "group relative flex h-full min-h-[520px] flex-col overflow-hidden",
        "rounded-[1.75rem] border border-white/10 bg-[#071311]",
        "shadow-[0_24px_80px_rgba(2,8,23,0.22)]",
        isFullscreen ? "rounded-none" : "",
      ].join(" ")}
      aria-label="Secure video consultation"
    >
      {/* Ambient stage lighting */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      {/* Header */}
      <header
        className={[
          "absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4 sm:p-5",
          "bg-gradient-to-b from-black/75 via-black/30 to-transparent",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-xl">
            <ShieldCheck size={19} strokeWidth={1.8} />
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Secure Video Consultation
            </h2>

            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-white/60 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              End-to-End Encrypted
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={[
              "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl sm:flex",
              remoteJoined
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/10 text-white/65",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                remoteJoined
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-300 animate-pulse",
              ].join(" ")}
            />
            {remoteJoined ? "Connected" : "Waiting for doctor"}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-white/75 backdrop-blur-xl transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </header>

      {/* Remote video */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#050908]">
        {remoteJoined ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex h-full min-h-[520px] items-center justify-center overflow-hidden px-6 text-center text-white">
            {/* Waiting-state visual */}
            <div className="absolute h-72 w-72 rounded-full border border-white/[0.04] animate-ping [animation-duration:3.5s]" />
            <div className="absolute h-52 w-52 rounded-full border border-primary/10" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] shadow-[0_0_0_12px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-2xl text-primary-light">
                  <ShieldCheck size={30} strokeWidth={1.6} />
                </div>
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 text-[11px] font-semibold text-amber-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
                Waiting for doctor
              </div>

              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Your consultation is ready
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
                The consultation will begin automatically when the doctor joins.
                You can check your microphone and camera while you wait.
              </p>
            </div>
          </div>
        )}

        {/* Local video */}
        <div className="absolute bottom-24 right-4 z-20 sm:bottom-28 sm:right-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_12px_35px_rgba(0,0,0,0.35)] ring-1 ring-black/20 transition duration-300 group-hover:scale-[1.01]">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-36 w-28 bg-slate-900 object-cover sm:h-44 sm:w-36"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-7">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/85">
                  You
                </span>

                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    camOn ? "bg-black/30 text-white/80" : "bg-red-500 text-white",
                  ].join(" ")}
                >
                  {camOn ? <Video size={11} /> : <VideoOff size={11} />}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control dock */}
      <div
        className={[
          "absolute bottom-4 left-1/2 z-30 -translate-x-1/2",
          "flex items-center gap-2 rounded-[1.25rem] border border-white/10",
          "bg-[#101716]/80 p-2 shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
          "transition-all duration-300 sm:bottom-5 sm:gap-2.5 sm:p-2.5",
          showControls
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => toggleTrack("audio", setMicOn)}
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 sm:h-12 sm:w-12",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            micOn
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-red-500/90 text-white shadow-lg shadow-red-500/20",
          ].join(" ")}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic size={19} /> : <MicOff size={19} />}
        </button>

        <button
          type="button"
          onClick={() => toggleTrack("video", setCamOn)}
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 sm:h-12 sm:w-12",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            camOn
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-red-500/90 text-white shadow-lg shadow-red-500/20",
          ].join(" ")}
          aria-label={camOn ? "Turn camera off" : "Turn camera on"}
          title={camOn ? "Turn camera off" : "Turn camera on"}
        >
          {camOn ? <Video size={19} /> : <VideoOff size={19} />}
        </button>

        <div className="mx-1 h-7 w-px bg-white/10" />

        <div
          className="hidden items-center gap-2 px-1.5 text-[10px] font-medium text-white/40 sm:flex"
          title="Connection status"
        >
          <Signal size={14} />
          <span>{remoteJoined ? "Secure" : "Standby"}</span>
        </div>

        <button
          type="button"
          onClick={onHangUp}
          className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white shadow-lg shadow-red-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-900/30 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:h-12 sm:px-5"
          aria-label="End consultation"
        >
          <PhoneOff size={17} />
          <span className="hidden sm:inline">End call</span>
        </button>
      </div>
    </section>
  );
}
