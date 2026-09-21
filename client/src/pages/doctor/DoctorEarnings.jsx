import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  LockKeyhole,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const PAYOUT_TONE = {
  pending: "pending",
  processing: "processing",
  paid: "success",
  failed: "danger",
};

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function BalanceStat({ icon: Icon, label, value, sub, accent = "green" }) {
  return (
    <div className={`balance-stat balance-stat-${accent} group`}>
      <div className="balance-stat-icon">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/38">
          {label}
        </p>
        <p className="mt-1 truncate font-mono text-2xl font-bold text-white">
          {value}
        </p>
        <p className="mt-1 text-[9px] text-white/32">{sub}</p>
      </div>

      <span className="balance-stat-orb" />
    </div>
  );
}

function LightStat({ icon: Icon, label, value, sub }) {
  return (
    <div className="earnings-light-card group">
      <div className="earnings-light-icon">
        <Icon size={16} />
      </div>

      <div className="mt-4">
        <p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 font-mono text-2xl font-bold text-slate-900">
          {value}
        </p>
        <p className="mt-1 text-[9px] text-slate-400">{sub}</p>
      </div>

      <div className="mt-4 h-px bg-slate-100" />

      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600">
        <TrendingUp size={11} />
        Earnings overview
      </div>
    </div>
  );
}

function PayoutRow({ payout }) {
  return (
    <div className="payout-row group">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="payout-period">
            {new Date(payout.periodStart).toLocaleDateString()} –{" "}
            {new Date(payout.periodEnd).toLocaleDateString()}
          </span>

          <span className="payout-count">
            {payout.consultationCount} consults
          </span>
        </div>

        <p className="mt-1.5 text-[10px] text-slate-400">
          {money(payout.grossAmount)} gross ·{" "}
          {payout.platformFeePercent}% platform fee
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-slate-900">
            {money(payout.netAmount)}
          </p>

          <div className="mt-1 flex justify-end">
            <StatusBadge tone={PAYOUT_TONE[payout.status]}>
              {payout.status}
            </StatusBadge>
          </div>
        </div>

        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary">
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value || 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-[8px] font-bold uppercase tracking-[.12em] text-white/35">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-bold text-white">
        {money(value)}
      </p>
    </div>
  );
}

export default function DoctorEarnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/doctors/me/earnings")
      .then(({ data: response }) => {
        if (mounted) setData(response);
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load earnings data."
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data?.recentAppointments) return [];

    return data.recentAppointments
      .slice()
      .reverse()
      .map((appointment) => ({
        date: new Date(
          appointment.scheduledStart
        ).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        fee: Number(appointment.consultationFee || 0),
      }));
  }, [data]);

  if (!data) {
    return (
      <div className="earnings-page min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-sm backdrop-blur-xl">
            <div className="h-4 w-28 rounded-full bg-slate-200" />
            <div className="mt-3 h-10 w-80 rounded-2xl bg-slate-200" />
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-[1.5rem] bg-slate-200/60"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="earnings-page relative min-h-screen overflow-hidden bg-[#f3f8f5] pb-10">
      <Navbar />

      <style>{`
        .earnings-page {
          background:
            radial-gradient(circle at 7% 8%, rgba(15,110,91,.08), transparent 31rem),
            radial-gradient(circle at 95% 23%, rgba(16,185,129,.05), transparent 29rem),
            #f3f8f5;
        }

        .earnings-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .28;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 84%);
        }

        /* ===== DARK MONTHLY BALANCE REFERENCE ===== */
        .balance-shell {
          position: relative;
          overflow: hidden;
          border-radius: 2rem;
          background:
            radial-gradient(circle at 75% -10%, rgba(163,230,53,.08), transparent 19rem),
            linear-gradient(135deg, #090d0c, #111715 52%, #0a0e0d);
          box-shadow: 0 32px 90px rgba(15,23,42,.18);
        }

        .balance-shell::after {
          content: "";
          position: absolute;
          top: -42%;
          left: -28%;
          width: 14%;
          height: 185%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(163,230,53,.11), transparent);
          animation: earnings-shine 7s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes earnings-shine {
          0%, 45% { left: -28%; }
          72%, 100% { left: 130%; }
        }

        .balance-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          top: -160px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
          background: rgba(163,230,53,.055);
          filter: blur(22px);
          transition: background .5s ease;
        }

        .balance-shell:hover .balance-glow {
          background: rgba(163,230,53,.085);
        }

        .balance-stat {
          position: relative;
          min-height: 118px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 22px;
          background: rgba(255,255,255,.045);
          padding: 17px;
          backdrop-filter: blur(12px);
          transition:
            transform .35s cubic-bezier(.22,1,.36,1),
            background .35s ease,
            border-color .35s ease;
        }

        .balance-stat:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,.065);
          border-color: rgba(163,230,53,.12);
        }

        .balance-stat-icon {
          display: flex;
          width: 35px;
          height: 35px;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(163,230,53,.08);
          color: #a3e635;
        }

        .balance-stat-orb {
          position: absolute;
          right: -18px;
          bottom: -28px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(163,230,53,.055);
          filter: blur(12px);
          transition: transform .45s ease;
        }

        .balance-stat:hover .balance-stat-orb {
          transform: scale(1.35);
        }

        /* ===== GLASS LIGHT CARDS ===== */
        .earnings-light-card {
          position: relative;
          overflow: hidden;
          min-height: 210px;
          border-radius: 1.7rem;
          border: 1px solid rgba(255,255,255,.82);
          background: rgba(255,255,255,.68);
          padding: 20px;
          box-shadow: 0 20px 58px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
          transition:
            transform .4s cubic-bezier(.22,1,.36,1),
            box-shadow .4s ease,
            background .4s ease;
        }

        .earnings-light-card::before,
        .earnings-light-card::after {
          content: "";
          position: absolute;
          width: 18%;
          height: 18%;
          background: rgba(15,110,91,.035);
          pointer-events: none;
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .earnings-light-card::before {
          top: 0;
          right: 0;
          border-radius: 0 1.7rem 0 100%;
        }

        .earnings-light-card::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.7rem;
        }

        .earnings-light-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,.84);
          box-shadow: 0 30px 72px rgba(15,110,91,.09);
        }

        .earnings-light-card:hover::before,
        .earnings-light-card:hover::after {
          width: 72%;
          height: 72%;
          border-radius: 1.7rem;
        }

        .earnings-light-icon {
          position: relative;
          z-index: 1;
          display: flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(15,110,91,.09);
          color: #0f6e5b;
          transition: transform .3s ease;
        }

        .earnings-light-card:hover .earnings-light-icon {
          transform: rotate(-4deg) scale(1.05);
        }

        /* ===== CHART ===== */
        .chart-panel {
          position: relative;
          overflow: hidden;
          border-radius: 2rem;
          border: 1px solid #17201c;
          background:
            radial-gradient(circle at 80% 0%, rgba(163,230,53,.045), transparent 22rem),
            #090d0c;
          box-shadow: 0 26px 75px rgba(15,23,42,.12);
        }

        .chart-panel::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(163,230,53,.30), transparent);
          pointer-events: none;
        }

        .chart-wrap {
          height: 280px;
        }

        .recharts-wrapper,
        .recharts-surface {
          overflow: visible;
        }

        /* ===== PAYOUT LIST ===== */
        .payout-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 76px;
          border-bottom: 1px solid #eef2ef;
          padding: 14px 0;
          transition: transform .25s ease, padding-left .25s ease;
        }

        .payout-row:last-child {
          border-bottom: 0;
        }

        .payout-row:hover {
          transform: translateX(3px);
        }

        .payout-period {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
        }

        .payout-count {
          border-radius: 999px;
          background: #f1f5f3;
          padding: 5px 8px;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .10em;
        }

        /* ===== LOWER PROMO ===== */
        .earnings-promo {
          position: relative;
          overflow: hidden;
          min-height: 260px;
          border-radius: 2rem;
          box-shadow: 0 26px 72px rgba(15,23,42,.12);
        }

        .earnings-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent);
          animation: promo-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes promo-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (max-width: 640px) {
          .payout-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .chart-wrap {
            height: 240px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .balance-shell::after,
          .earnings-light-card,
          .earnings-light-card::before,
          .earnings-light-card::after,
          .balance-stat,
          .balance-stat-orb,
          .payout-row,
          .earnings-promo::after {
            animation: none !important;
            transition: none !important;
          }

          .earnings-light-card:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-9">
        {/* Dark balance hero */}
        <section className="balance-shell">
          <div className="balance-glow" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-white/58">
                    <Wallet size={12} className="text-lime-300" />
                    Monthly balance
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-300/10 bg-lime-300/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-lime-200/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    Updated from account
                  </span>
                </div>

                <p className="mt-7 text-[9px] font-bold uppercase tracking-[.16em] text-white/32">
                  Doctor earnings
                </p>

                <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Revenue that stays
                  <span className="block text-lime-300">
                    easy to understand.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/38">
                  Track consultation revenue, recent fees, pending payouts and
                  platform deductions from one focused financial workspace.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-4 backdrop-blur-md lg:min-w-[230px]">
                <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/30">
                  Estimated pending payout
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-white">
                  {money(data.estimatedPendingPayout)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-lime-300">
                  <TrendingUp size={11} />
                  After platform fee
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <BalanceStat
                icon={IndianRupee}
                label="Total earned"
                value={money(data.totalEarned)}
                sub={`${data.totalConsultations} total consultations`}
              />

              <BalanceStat
                icon={TrendingUp}
                label="This week"
                value={money(data.thisWeek.earned)}
                sub={`${data.thisWeek.count} consultations`}
              />

              <BalanceStat
                icon={CalendarClock}
                label="This month"
                value={money(data.thisMonth.earned)}
                sub={`${data.thisMonth.count} consultations`}
              />

              <BalanceStat
                icon={BadgeIndianRupee}
                label="Pending payout"
                value={money(data.estimatedPendingPayout)}
                sub="Expected net amount"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Light overview */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <LightStat
            icon={BarChart3}
            label="Total consultations"
            value={data.totalConsultations}
            sub="Completed consultation count"
          />

          <LightStat
            icon={Clock3}
            label="Recent fees"
            value={chartData.length}
            sub="Recent appointments visible in chart"
          />

          <LightStat
            icon={CheckCircle2}
            label="Payout records"
            value={data.payouts?.length || 0}
            sub="Recorded payout periods"
          />
        </section>

        {/* Chart */}
        {chartData.length > 0 && (
          <section className="chart-panel mt-6 p-5 sm:p-7">
            <div className="relative z-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-lime-200/65">
                  <TrendingUp size={11} />
                  Revenue signal
                </span>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Recent consultation fees
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-white/30">
                  Consultation fee movement across the latest appointments.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.035] px-4 py-3">
                <p className="text-[8px] font-bold uppercase tracking-[.12em] text-white/25">
                  Latest fee
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-white">
                  {money(chartData.at(-1)?.fee)}
                </p>
              </div>
            </div>

            <div className="chart-wrap relative z-10 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 18, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="earnings-area-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a3e635"
                        stopOpacity="0.20"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a3e635"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,.055)"
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,.28)",
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,.22)",
                      fontSize: 9,
                    }}
                    width={45}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "rgba(163,230,53,.15)",
                      strokeWidth: 1,
                    }}
                    content={<ChartTooltip />}
                  />

                  <Area
                    type="monotone"
                    dataKey="fee"
                    stroke="#a3e635"
                    strokeWidth={2.5}
                    fill="url(#earnings-area-gradient)"
                    dot={{
                      r: 3.5,
                      fill: "#a3e635",
                      stroke: "#090d0c",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 5,
                      fill: "#a3e635",
                      stroke: "#d9f99d",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/6 pt-4 text-[8px] uppercase tracking-[.13em] text-white/22">
              <span>Consultation revenue</span>
              <span>KapHealth earnings workspace</span>
            </div>
          </section>
        )}

        {/* Payout history */}
        <section className="mt-6 rounded-[2rem] border border-white/80 bg-white/68 p-6 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Payout history</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Money moving through the account
              </h2>
              <p className="mt-1 text-[10px] text-slate-400">
                Gross revenue, platform deductions and net payout by period.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
              <Wallet size={11} />
              {data.payouts?.length || 0} periods
            </span>
          </div>

          <div className="mt-5 rounded-[1.55rem] border border-slate-100 bg-white/45 px-4">
            {data.payouts?.length ? (
              data.payouts.map((payout) => (
                <PayoutRow key={payout._id} payout={payout} />
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet size={22} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  No payouts processed yet.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Payout records will appear here once a period is processed.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Lower info */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="earnings-promo group">
            <div className="absolute inset-0 bg-slate-950" />

            <div className="absolute inset-0 bg-gradient-to-br from-[#10241d] via-slate-950 to-[#050807]" />

            <div className="absolute right-[-55px] top-[-75px] h-64 w-64 rounded-full border border-lime-300/10 bg-lime-300/[0.035]" />
            <div className="absolute bottom-[-95px] left-[30%] h-64 w-64 rounded-full bg-primary/[0.10] blur-3xl" />

            <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-7 text-white sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-lime-300/10 bg-lime-300/[0.05] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-lime-200/75">
                  Financial workspace
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lime-300">
                  <BadgeIndianRupee size={15} />
                </span>
              </div>

              <div className="max-w-xl">
                <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/25">
                  Keep the bigger picture visible
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Revenue, deductions,
                  <span className="block text-lime-300">
                    then net payout.
                  </span>
                </h2>

                <p className="mt-2 max-w-lg text-xs leading-5 text-white/35">
                  The dashboard keeps the numbers in the same visual system so
                  you can scan performance without digging through tables.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/68 p-6 shadow-[0_24px_75px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="eyebrow">Payout summary</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Current financial snapshot
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-slate-200/75 bg-white/55 p-4">
                <p className="text-[8px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Monthly earned
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
                  {money(data.thisMonth.earned)}
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  {data.thisMonth.count} consults
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-slate-200/75 bg-white/55 p-4">
                <p className="text-[8px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Weekly earned
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
                  {money(data.thisWeek.earned)}
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  {data.thisWeek.count} consults
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-primary/10 bg-primary/[0.035] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <LockKeyhole size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Earnings data stays in the doctor workspace
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Keep payout details, consultation totals and account
                    financial data behind authenticated doctor access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth · doctor earnings
          <ChevronRight size={11} />
          <ArrowUpRight size={11} className="text-primary/45" />
        </div>
      </main>
    </div>
  );
}
