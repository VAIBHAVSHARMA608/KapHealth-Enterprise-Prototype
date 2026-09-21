import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Heart,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const EMPTY_FORM = {
  name: "",
  relation: "child",
  dateOfBirth: "",
  gender: "male",
  bloodGroup: "",
};

const FAMILY_PROMO_IMAGE =
  "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1200&q=85";

const RELATION_LABEL = {
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  sibling: "Sibling",
  other: "Other",
};

function Field({ label, children, className = "" }) {
  return (
    <div className={`family-field ${className}`}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function FamilyMemberCard({ member, index, onRemove, removing }) {
  const initials = member.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="family-member group relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,23,42,.11)]">
      <span className="family-corner family-corner-top" />
      <span className="family-corner family-corner-bottom" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-bold text-white shadow-lg shadow-primary/15 transition duration-500 group-hover:scale-105 group-hover:rotate-[-3deg]">
              {initials || "FM"}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
              <BadgeCheck size={10} />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                {member.name}
              </h2>

              <span className="rounded-full bg-primary/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
                {RELATION_LABEL[member.relation] || member.relation}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
              {member.dateOfBirth && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {new Date(member.dateOfBirth).toLocaleDateString()}
                </span>
              )}

              {member.gender && (
                <span className="capitalize">{member.gender}</span>
              )}

              {member.bloodGroup && (
                <span className="font-semibold text-slate-500">
                  {member.bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(member._id)}
          disabled={removing}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          aria-label={`Remove ${member.name}`}
        >
          {removing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <Heart size={12} className="text-primary" />
          Care profile
        </div>

        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary opacity-70 transition group-hover:opacity-100">
          Managed care
          <ArrowRight size={12} className="transition group-hover:translate-x-1" />
        </span>
      </div>

      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      <span className="absolute right-4 top-4 text-[9px] font-bold text-slate-200">
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}

export default function Family() {
  const [dependents, setDependents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  async function load() {
    setLoading(true);

    try {
      const { data } = await api.get("/patients/me/profile");
      setDependents(data.profile?.dependents || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load your family members."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/patients/me/dependents", form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't add family member."
      );
    }
  }

  async function remove(id) {
    setError("");
    setRemovingId(id);

    try {
      await api.delete(`/patients/me/dependents/${id}`);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't remove family member."
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="family-page relative min-h-screen overflow-hidden bg-[#f4f9f6]">
      <Navbar />

      <style>{`
        .family-page {
          background:
            radial-gradient(circle at 8% 7%, rgba(15,110,91,.08), transparent 28rem),
            radial-gradient(circle at 93% 30%, rgba(16,185,129,.055), transparent 26rem),
            #f4f9f6;
        }

        .family-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .38;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }

        .family-corner {
          position: absolute;
          width: 20%;
          height: 20%;
          background: rgba(15,110,91,.05);
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .family-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.7rem 0 100%;
        }

        .family-corner-bottom {
          left: 0;
          bottom: 0;
          border-radius: 0 100% 0 1.7rem;
          background: rgba(15,110,91,.035);
        }

        .family-member:hover .family-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.7rem;
        }

        .family-promo::after {
          content: "";
          position: absolute;
          top: -30%;
          left: -30%;
          width: 16%;
          height: 180%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.2),
            transparent
          );
          animation: family-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .family-action {
          position: relative;
          isolation: isolate;
        }

        .family-action::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f6e5b, #32b394, #80ddc7, #0f6e5b);
          background-size: 300% 300%;
          animation: family-gradient 7s ease infinite;
          filter: blur(5px);
          opacity: .6;
        }

        .family-action::after {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: -1;
          border-radius: 999px;
          background: #0f6e5b;
        }

        .family-action:hover {
          transform: translateY(-2px);
        }

        .family-form {
          animation: family-form-in .4s cubic-bezier(.22,1,.36,1);
        }

        @keyframes family-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @keyframes family-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes family-form-in {
          from { opacity: 0; transform: translateY(10px) scale(.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .family-promo::after,
          .family-action::before {
            animation: none;
          }

          .family-member:hover .family-corner,
          .family-form {
            transition: none;
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header + promo */}
        <section className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_20px_70px_rgba(15,23,42,.065)] backdrop-blur-2xl sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5">
                <Users size={13} className="text-primary" />
                Family care
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                <ShieldCheck size={11} />
                Private profiles
              </span>
            </div>

            <p className="eyebrow mt-7">Family</p>

            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
              Care for the people
              <span className="block text-primary">
                who matter to you.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Add family members you manage care for, then book consultations
              or other healthcare services on their behalf.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="family-action inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition-all duration-300"
              >
                <Plus size={16} />
                Add family member
              </button>

              <Link
                to="/patient/doctors"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
              >
                Find a doctor
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Advertising / healthcare promo */}
          <aside className="family-promo relative min-h-[290px] overflow-hidden rounded-[2rem] shadow-[0_24px_75px_rgba(15,23,42,.12)]">
            <img
              src={FAMILY_PROMO_IMAGE}
              alt="Family healthcare and wellbeing"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-white backdrop-blur-md">
                  KapHealth
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md">
                  <Heart size={16} />
                </span>
              </div>

              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
                  Connected family care
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  One place for every profile.
                </h2>

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Keep family members ready for consultations, lab bookings,
                  and wellness journeys.
                </p>

                <Link
                  to="/patient/doctors"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Start a consultation
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* Member list / form */}
        <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Managed profiles</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Your family members
                </h2>
              </div>

              {!loading && (
                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                  {dependents.length}{" "}
                  {dependents.length === 1 ? "profile" : "profiles"}
                </span>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {loading ? (
                [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[170px] animate-pulse rounded-[1.7rem] border border-slate-200 bg-white/60"
                  />
                ))
              ) : dependents.length > 0 ? (
                dependents.map((member, index) => (
                  <FamilyMemberCard
                    key={member._id}
                    member={member}
                    index={index}
                    removing={removingId === member._id}
                    onRemove={remove}
                  />
                ))
              ) : !showForm ? (
                <div className="corner-reveal-sm relative overflow-hidden rounded-[1.7rem] border border-dashed border-slate-300 bg-white/55 p-8 text-center sm:col-span-2">
                  <div className="relative z-10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Users size={25} />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      No family members yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Add a profile so you can manage consultations and
                      healthcare services for someone you care for.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="btn-secondary mt-5"
                    >
                      <Plus size={15} />
                      Add the first member
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Add member form */}
          {showForm && (
            <section className="family-form relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_22px_70px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-7 lg:self-start">
              <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-primary/[0.07] blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">New profile</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      Add family member
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Add only the information needed to manage their care.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(EMPTY_FORM);
                      setError("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close form"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Field label="Full name">
                    <input
                      className="input h-12"
                      placeholder="Family member's name"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Relation">
                      <select
                        className="input h-12"
                        value={form.relation}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            relation: e.target.value,
                          })
                        }
                      >
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>

                    <Field label="Gender">
                      <select
                        className="input h-12"
                        value={form.gender}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>

                    <Field label="Date of birth">
                      <input
                        className="input h-12"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Blood group">
                      <input
                        className="input h-12"
                        placeholder="Optional"
                        value={form.bloodGroup}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bloodGroup: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl border border-primary/10 bg-primary/[0.035] px-3.5 py-3 text-[10px] leading-5 text-slate-500">
                    <ShieldCheck
                      size={13}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    This profile helps you book and manage care on their
                    behalf.
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm(EMPTY_FORM);
                        setError("");
                      }}
                      className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="family-action flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white"
                    >
                      <Plus size={14} />
                      Save member
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </section>

        {/* Bottom campaign banner */}
        <section className="mt-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F6E5B] to-[#073E35] p-6 text-white shadow-[0_25px_75px_rgba(15,110,91,.17)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Stethoscope size={17} />
                <span className="text-[10px] font-bold uppercase tracking-[.15em]">
                  Family wellness
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Everyone deserves connected care.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Start a consultation for yourself or a family member and keep
                the journey connected inside KapHealth.
              </p>
            </div>

            <Link
              to="/patient/doctors"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Find a doctor
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
