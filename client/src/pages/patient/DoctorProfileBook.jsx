import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  IndianRupee,
  LockKeyhole,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import BookingForPicker from "../../components/BookingForPicker.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

/* Demo media used for the promotional layer. Replace with local assets later. */
const PROMO_IMAGE =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85";

const PROMO_VIDEO_PAGE =
  "https://www.pexels.com/video/a-person-having-online-consultation-with-a-doctor-8375447/";

const REVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=240&q=80",
];

function generateUpcomingSlots() {
  const days = [];

  for (let d = 0; d < 5; d += 1) {
    const date = new Date();
    date.setDate(date.getDate() + d);

    const slots = [9, 10, 11, 15, 16, 17]
      .map((hour) => {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        return slot;
      })
      .filter((slot) => slot > new Date());

    if (slots.length) {
      days.push({ date, slots });
    }
  }

  return days;
}

function SectionShell({ children, className = "" }) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2rem] border border-white/80",
        "bg-white/65 shadow-[0_20px_65px_rgba(15,23,42,.07)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function SlotButton({ slot, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group relative flex min-w-[120px] items-center justify-center gap-2 overflow-hidden rounded-xl border px-3.5 py-2.5 text-xs font-semibold",
        "transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? "border-primary bg-primary text-white shadow-[0_10px_25px_rgba(15,110,91,.18)]"
          : "border-slate-200/80 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:text-primary hover:shadow-sm",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute -right-5 -top-5 h-10 w-10 rounded-full transition-all duration-500",
          selected
            ? "bg-white/10 group-hover:scale-[5]"
            : "bg-primary/[0.06] group-hover:scale-[4]",
        ].join(" ")}
      />

      <span className="relative z-10">
        <Clock3 size={13} />
      </span>
      <span className="relative z-10">
        {slot.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </button>
  );
}

function ReviewCard({ review, index }) {
  const avatar = REVIEW_IMAGES[index % REVIEW_IMAGES.length];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/[0.05] transition-transform duration-500 group-hover:scale-[4]" />

      <div className="relative z-10 flex items-start gap-3">
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-slate-800">
              {review.author.name}
            </p>

            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
              <Star size={10} fill="currentColor" />
              {review.rating}
            </span>
          </div>

          {review.comment ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {review.comment}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-slate-300">
              No written feedback
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function BookingSummary({ profile, selectedSlot, bookingFor, onConfirm, booking }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-6 text-white shadow-[0_22px_65px_rgba(15,110,91,.20)] sm:p-7">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-200/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
            <CalendarDays size={17} />
          </span>

          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
            Booking summary
          </span>
        </div>

        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200/55">
          Selected consultation
        </p>

        <h3 className="mt-1 text-2xl font-semibold tracking-tight">
          {selectedSlot
            ? selectedSlot.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "Choose a time"}
        </h3>

        <p className="mt-1 text-sm text-white/55">
          {selectedSlot
            ? selectedSlot.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Select any available slot from the schedule."}
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Doctor</span>
            <span className="font-medium text-white">
              Dr. {profile.user.name}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-white/50">For</span>
            <span className="font-medium capitalize text-white">
              {bookingFor.type === "self"
                ? "Myself"
                : bookingFor.dependentName || "Family member"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-white/50">Consultation fee</span>
            <span className="font-mono font-semibold text-white">
              ₹{profile.consultationFee}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedSlot || booking}
          onClick={onConfirm}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white via-white to-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_rgba(255,255,255,.65),0_8px_18px_rgba(0,0,0,.16)] transition-all duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_6px_4px_rgba(255,255,255,.75),0_12px_24px_rgba(0,0,0,.20)] disabled:pointer-events-none disabled:opacity-45"
        >
          {booking ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
              Preparing checkout...
            </>
          ) : (
            <>
              Book & pay ₹{profile.consultationFee}
              <ArrowRight
                size={15}
                className="text-primary transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/35">
          <LockKeyhole size={12} />
          Secure payment
          <span className="h-1 w-1 rounded-full bg-white/20" />
          Razorpay
        </div>
      </div>
    </div>
  );
}

export default function DoctorProfileBook() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [bookingFor, setBookingFor] = useState({ type: "self" });
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [favorite, setFavorite] = useState(false);

  const days = useMemo(() => generateUpcomingSlots(), []);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const [profileResponse, reviewResponse] = await Promise.all([
          api.get(`/doctors/${doctorId}`),
          api.get(`/reviews/doctor/${doctorId}`),
        ]);

        if (!mounted) return;

        setProfile(profileResponse.data.profile);
        setReviews(reviewResponse.data.reviews || []);
      } catch (err) {
        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Couldn't load this doctor's profile."
        );
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [doctorId]);

  async function confirmBooking() {
    if (!user) {
      return navigate("/login");
    }

    if (!selectedSlot || booking) return;

    setBooking(true);
    setError("");

    try {
      const { data } = await api.post("/appointments", {
        doctorId,
        scheduledStart: selectedSlot.toISOString(),
        reasonForVisit: reason,
        paymentMethod: "razorpay",
        bookingFor,
      });

      if (data.devMode) {
        return navigate(`/patient/appointments/${data.appointment._id}`);
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "KapHealth",
        description: "Consultation fee",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            navigate(`/patient/appointments/${data.appointment._id}`);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please check your appointment."
            );
            setBooking(false);
          }
        },
        modal: {
          ondismiss: () => setBooking(false),
        },
        prefill: {
          name: user.name,
        },
        theme: {
          color: "#0F6E5B",
        },
      };

      if (!window.Razorpay) {
        setError(
          "Payment SDK not loaded. Add the Razorpay checkout script to index.html."
        );
        setBooking(false);
        return;
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment could not be completed."
        );
        setBooking(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't book this slot."
      );
      setBooking(false);
    }
  }

  if (!profile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f9f6]">
        <Navbar />

        <main className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center justify-center px-5">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope size={24} className="animate-pulse" />
            </div>
            <p className="eyebrow mt-5">
              {error ? "Profile unavailable" : "Doctor profile"}
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {error ? "Couldn't open this profile" : "Loading profile"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "We're loading availability, credentials, and patient feedback."}
            </p>
            {error && (
              <Link
                to="/patient/doctors"
                className="btn-secondary mt-6 inline-flex"
              >
                <ArrowLeft size={15} />
                Back to doctors
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .doctor-profile-page {
          background:
            radial-gradient(circle at 7% 8%, rgba(15,110,91,.08), transparent 28rem),
            radial-gradient(circle at 92% 24%, rgba(16,185,129,.06), transparent 28rem),
            #f4f9f6;
        }

        .doctor-profile-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .4;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom, black, transparent 75%);
        }

        .doctor-hero-card {
          position: relative;
          overflow: hidden;
        }

        .doctor-hero-card::before,
        .doctor-hero-card::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.05);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .doctor-hero-card::before {
          top: 0;
          right: 0;
          border-radius: 0 2rem 0 100%;
        }

        .doctor-hero-card::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 2rem;
        }

        .doctor-hero-card:hover::before,
        .doctor-hero-card:hover::after {
          width: 70%;
          height: 70%;
          border-radius: 2rem;
        }

        .profile-avatar {
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease;
        }

        .doctor-hero-card:hover .profile-avatar {
          transform: translateY(-3px) rotate(-2deg) scale(1.03);
          box-shadow: 0 20px 40px rgba(15,110,91,.16);
        }

        .promo-shine::after {
          content: "";
          position: absolute;
          top: -40%;
          left: -30%;
          width: 16%;
          height: 180%;
          transform: rotate(19deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.18),
            transparent
          );
          animation: promo-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes promo-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 125%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-avatar,
          .doctor-hero-card::before,
          .doctor-hero-card::after,
          .promo-shine::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/patient/doctors"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl transition group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back to doctors
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
            <ShieldCheck size={13} className="text-primary" />
            Verified healthcare
          </div>
        </div>

        {/* Doctor identity */}
        <SectionShell className="doctor-hero-card p-6 sm:p-8">
          <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="absolute -inset-2 rounded-[1.6rem] bg-primary/10 blur-xl" />
                <img
                  src={
                    profile.user.avatarUrl ||
                    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                      profile.user.name
                    )}`
                  }
                  className="profile-avatar relative h-28 w-28 rounded-[1.5rem] border-4 border-white object-cover shadow-lg"
                  alt=""
                />
                <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm">
                  <BadgeCheck size={15} />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700">
                    Verified doctor
                  </span>

                  <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-primary">
                    Video available
                  </span>
                </div>

                <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Dr. {profile.user.name}
                </h1>

                <p className="mt-2 text-sm font-medium text-primary">
                  {profile.specializations.join(" · ")}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    {profile.ratingAverage || "New"}
                    <span className="text-slate-300">·</span>
                    {profile.ratingCount || 0} reviews
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
                    <Stethoscope size={12} />
                    {profile.yearsOfExperience} yrs experience
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
                    <IndianRupee size={12} />
                    {profile.consultationFee} / consult
                  </span>
                </div>

                {profile.bio && (
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-5 text-white shadow-lg">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:26px_26px]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <Video size={17} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setFavorite((value) => !value)}
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
                      favorite
                        ? "border-rose-200/20 bg-rose-400/15 text-rose-200"
                        : "border-white/10 bg-white/10 text-white/55 hover:bg-white/15 hover:text-white",
                    ].join(" ")}
                    aria-label={
                      favorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Heart
                      size={15}
                      fill={favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <p className="mt-7 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200/55">
                  Consultation
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₹{profile.consultationFee}
                  <span className="ml-1 text-xs font-normal text-white/40">
                    / session
                  </span>
                </p>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  Secure browser-based video consultation with live chat.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[10px] text-white/45">
                  <LockKeyhole size={12} />
                  Secure session
                </div>
              </div>
            </div>
          </div>
        </SectionShell>

        {/* Promo */}
        <section className="promo-shine relative mt-5 overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_24px_75px_rgba(15,23,42,.13)]">
          <div className="absolute inset-0">
            <img
              src={PROMO_IMAGE}
              alt="Doctor providing a digital consultation"
              className="h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
          </div>

          <div className="relative z-10 flex min-h-[215px] items-center justify-between p-6 sm:p-8">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
                <Sparkles size={11} />
                KapHealth virtual care
              </span>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Skip the waiting room.
                <span className="block text-emerald-200">
                  Meet your doctor online.
                </span>
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Choose an available slot, complete secure payment, and join
                your consultation from your browser.
              </p>

              <a
                href={PROMO_VIDEO_PAGE}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
              >
                <Play size={13} fill="currentColor" />
                See virtual-care demo
              </a>
            </div>
          </div>
        </section>

        {/* Booking */}
        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
          <SectionShell className="p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Step 01</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    Pick a consultation slot
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose from the next five days of demo availability.
                  </p>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live availability
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {days.map(({ date, slots }) => (
                  <div
                    key={date.toDateString()}
                    className="corner-reveal relative overflow-hidden rounded-2xl border border-slate-200/75 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-md"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
                          {date.toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>

                        <span className="text-[9px] font-semibold text-primary">
                          {slots.length} slots
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2">
                        {slots.map((slot) => (
                          <SlotButton
                            key={slot.toISOString()}
                            slot={slot}
                            selected={
                              selectedSlot?.getTime() === slot.getTime()
                            }
                            disabled={booking}
                            onClick={() => setSelectedSlot(slot)}
                          />
                        ))}
                      </div>
                    </div>

                    <style>{`
                      .corner-reveal::before,
                      .corner-reveal::after {
                        content: "";
                        position: absolute;
                        width: 18%;
                        height: 18%;
                        pointer-events: none;
                        background: rgba(15,110,91,.035);
                        transition: all .5s cubic-bezier(.22,1,.36,1);
                      }

                      .corner-reveal::before {
                        top: 0;
                        right: 0;
                        border-radius: 0 1rem 0 100%;
                      }

                      .corner-reveal::after {
                        bottom: 0;
                        left: 0;
                        border-radius: 0 100% 0 1rem;
                      }

                      .corner-reveal:hover::before,
                      .corner-reveal:hover::after {
                        width: 100%;
                        height: 100%;
                        border-radius: 1rem;
                      }
                    `}</style>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                <BookingForPicker
                  value={bookingFor}
                  onChange={setBookingFor}
                />
              </div>

              <div className="mt-6">
                <label className="label" htmlFor="visit-reason">
                  Reason for visit
                </label>

                <div className="relative">
                  <MessageCircle
                    size={15}
                    className="absolute left-4 top-5 text-slate-400"
                  />

                  <textarea
                    id="visit-reason"
                    className="input min-h-[110px] resize-y pl-10"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    placeholder="Optional: briefly describe what you'd like to discuss..."
                  />
                </div>

                <p className="mt-1.5 text-right text-[9px] text-slate-400">
                  {reason.length} / 500
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck size={13} className="text-primary" />
                You will review the final booking amount before payment.
              </div>
            </div>
          </SectionShell>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingSummary
              profile={profile}
              selectedSlot={selectedSlot}
              bookingFor={bookingFor}
              onConfirm={confirmBooking}
              booking={booking}
            />
          </aside>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <SectionShell className="mt-7 p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Patient feedback</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    What patients say
                  </h2>
                </div>

                <span className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700">
                  <Star size={12} fill="currentColor" />
                  {profile.ratingAverage || "New"} average
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {reviews.map((review, index) => (
                  <ReviewCard key={review._id} review={review} index={index} />
                ))}
              </div>
            </div>
          </SectionShell>
        )}

        <div className="mt-7 rounded-[2rem] border border-white/80 bg-white/60 p-5 text-center shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
            <LockKeyhole size={12} className="text-primary" />
            KapHealth keeps your appointment journey connected from booking to
            consultation.
          </div>
        </div>
      </main>
    </div>
  );
}
