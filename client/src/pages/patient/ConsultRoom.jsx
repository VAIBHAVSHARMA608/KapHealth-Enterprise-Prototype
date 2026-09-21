import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Star,
  Video,
  VideoOff,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import VideoCallStage from "../../components/VideoCallStage.jsx";
import ChatBox from "../../components/ChatBox.jsx";
import { useVideoCall } from "../../hooks/useVideoCall.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../services/api.js";
import api from "../../services/api.js";

const STATUS_COPY = {
  confirmed: "Consultation scheduled",
  in_progress: "Consultation in progress",
  completed: "Consultation completed",
};

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const activeValue = hover || value;

  return (
    <div
      className="rating flex items-center justify-center gap-1"
      role="radiogroup"
      aria-label="Rate your consultation"
    >
      {[5, 4, 3, 2, 1].map((number) => (
        <span key={number}>
          <input
            id={`rating-${number}`}
            type="radio"
            name="consultation-rating"
            value={number}
            checked={value === number}
            onChange={() => onChange(number)}
            className="sr-only"
          />
          <label
            htmlFor={`rating-${number}`}
            aria-label={`${number} out of 5 stars`}
            onMouseEnter={() => setHover(number)}
            onMouseLeave={() => setHover(0)}
            className={[
              "cursor-pointer text-[30px] leading-none transition-all duration-200",
              activeValue >= number
                ? "text-amber-400"
                : "text-slate-300",
              "hover:-translate-y-0.5 hover:scale-110",
            ].join(" ")}
          >
            ★
          </label>
        </span>
      ))}
    </div>
  );
}

export default function ConsultRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [roomAccess, setRoomAccess] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [endedAt, setEndedAt] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      try {
        const [appointmentResponse, accessResponse] = await Promise.all([
          api.get(`/appointments/${id}`),
          api.get(`/appointments/${id}/room-access`),
        ]);

        if (!mounted) return;

        setAppointment(appointmentResponse.data.appointment);
        setRoomAccess(accessResponse.data);
      } catch (err) {
        if (!mounted) return;

        setLoadError(
          err.response?.data?.message ||
            "We couldn't open this consultation room."
        );
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
    callEnded,
  } = useVideoCall({
    roomId: roomAccess?.roomId,
    accessToken: getAccessToken(),
    iceServers: roomAccess?.iceServers,
  });

  useEffect(() => {
    if (callEnded && !endedAt) {
      setEndedAt(new Date());
    }
  }, [callEnded, endedAt]);

  async function endCall() {
    try {
      hangUp();
      await api.post(`/appointments/${id}/end-call`);
      setEndedAt(new Date());
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
          "We couldn't end the consultation cleanly."
      );
    }
  }

  async function submitReview() {
    if (!appointment?.doctor?._id || reviewSubmitting) return;

    setReviewSubmitting(true);

    try {
      await api.post("/reviews", {
        targetType: "doctor",
        targetId: appointment.doctor._id,
        rating,
        comment: "",
      });

      setReviewed(true);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
          "Couldn't save your rating."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  const statusText = useMemo(
    () =>
      STATUS_COPY[appointment?.status] ||
      "Secure consultation session",
    [appointment?.status]
  );

  if (!appointment) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />

        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {loadError ? (
                <VideoOff size={24} />
              ) : (
                <Video size={24} className="animate-pulse" />
              )}
            </div>

            <p className="eyebrow mt-5">
              {loadError ? "Room unavailable" : "Secure consultation"}
            </p>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {loadError
                ? "Unable to open consultation"
                : "Preparing your consultation"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {loadError ||
                "We're securely preparing video, chat, and your consultation session."}
            </p>

            {loadError && (
              <Link
                to={`/patient/appointments/${id}`}
                className="btn-secondary mt-6"
              >
                <ArrowLeft size={15} />
                Back to appointment
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f3f8f5]">
      <Navbar />

      <style>{`
        .consult-corner {
          position: relative;
          overflow: hidden;
        }

        .consult-corner::before,
        .consult-corner::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.055);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .consult-corner::before {
          top: 0;
          right: 0;
          border-radius: 0 1.5rem 0 100%;
        }

        .consult-corner::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.5rem;
        }

        .consult-corner:hover::before,
        .consult-corner:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          background: rgba(15,110,91,.03);
        }

        .post-call-card {
          animation: consult-card-in .45s cubic-bezier(.22,1,.36,1);
        }

        .rating label {
          display: inline-block;
        }

        @keyframes consult-card-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .consult-corner::before,
          .consult-corner::after,
          .post-call-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-56 top-10 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(15,110,91,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,110,91,1)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      {/* Consultation toolbar */}
      <div className="relative z-10 border-b border-slate-200/70 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/patient/appointments/${id}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/75 text-slate-500 shadow-sm transition hover:-translate-x-0.5 hover:text-primary"
              aria-label="Back to appointment"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  Consultation with Dr. {appointment.doctor.name}
                </h1>

                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 sm:inline-flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {remoteJoined ? "Connected" : "Waiting"}
                </span>
              </div>

              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-slate-500">
                <ShieldCheck size={12} className="text-primary" />
                {statusText}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/65 px-3 py-1.5 text-[10px] font-medium text-slate-500">
              <LockKeyhole size={12} className="text-primary" />
              Encrypted session
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/65 px-3 py-1.5 text-[10px] font-medium text-slate-500">
              <MessageCircle size={12} />
              {messages.length}{" "}
              {messages.length === 1 ? "message" : "messages"}
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        {loadError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            {loadError}
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* Video */}
          <section className="consult-corner min-h-[620px] rounded-[1.9rem] border border-white/75 bg-white/45 p-1 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <div className="relative z-10 h-full min-h-[612px]">
              <VideoCallStage
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                remoteJoined={remoteJoined}
                onHangUp={endCall}
              />
            </div>
          </section>

          {/* Chat */}
          <aside className="consult-corner min-h-[560px] overflow-hidden rounded-[1.9rem] border border-white/75 bg-white/60 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageCircle size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      Consultation chat
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Saved to this appointment
                    </p>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.05] text-primary">
                  <ShieldCheck size={15} />
                </div>
              </div>

              <div className="min-h-0 flex-1">
                <ChatBox
                  messages={messages}
                  onSend={sendMessage}
                  myUserId={user?.id}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Post-call modal */}
      {callEnded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="post-call-card w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0F6E5B] to-[#073E35] px-6 pb-7 pt-7 text-white">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-200/10 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <CheckCircle2 size={24} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-white/55">
                    Session complete
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/55">
                  Consultation ended
                </p>

                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Your consultation is complete.
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
                  Dr. {appointment.doctor.name} can issue an e-prescription
                  shortly, if clinically appropriate.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              {!reviewed ? (
                <>
                  <div className="consult-corner rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="eyebrow">Quick feedback</p>
                          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                            How was your consultation?
                          </h3>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                          <Star size={17} />
                        </div>
                      </div>

                      <div className="mt-5">
                        <StarRating value={rating} onChange={setRating} />
                      </div>

                      <p className="mt-3 text-center text-[10px] text-slate-400">
                        {rating === 5
                          ? "Excellent experience"
                          : rating >= 4
                            ? "Very good experience"
                            : rating >= 3
                              ? "Good experience"
                              : rating === 2
                                ? "Could be better"
                                : "Needs improvement"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    <Link
                      to={`/patient/appointments/${id}`}
                      className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                    >
                      View appointment
                    </Link>

                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={reviewSubmitting}
                      className="group flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white to-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_rgba(255,255,255,.7),0_7px_16px_rgba(148,163,184,.28)] transition hover:-translate-y-0.5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                    >
                      {reviewSubmitting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
                      ) : (
                        <Check size={15} className="text-primary" />
                      )}
                      {reviewSubmitting ? "Saving..." : "Submit rating"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={25} />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Thanks for your feedback.
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Your rating helps us improve the KapHealth experience.
                  </p>

                  <Link
                    to={`/patient/appointments/${id}`}
                    className="btn-primary mt-5 inline-flex"
                  >
                    View appointment
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <LockKeyhole size={12} className="text-primary/70" />
                Secure appointment record
                {endedAt && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <Clock3 size={11} />
                    Session ended
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
