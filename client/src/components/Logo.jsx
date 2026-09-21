export default function Logo({ className = "" }) {
  return (
    <div
      className={`group inline-flex select-none items-center gap-3.5 ${className}`}
      aria-label="Kap Health"
    >
      {/* Mark */}
      <div className="relative shrink-0">
        {/* Soft ambient halo */}
        <div className="absolute -inset-1 rounded-[1.05rem] bg-primary/15 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.95rem] border border-white/20 bg-gradient-to-br from-[#147C68] via-[#0F6E5B] to-[#0A5145] shadow-[0_8px_22px_rgba(15,110,91,0.20)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_28px_rgba(15,110,91,0.28)]">
          {/* Glass highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

          <svg
            width="27"
            height="27"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className="relative transition-transform duration-300 group-hover:scale-105"
          >
            {/* Medical pulse */}
            <path
              d="M4 16H9L11.6 9.2L16.3 22.4L19.3 16H28"
              stroke="white"
              strokeWidth="2.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Protective circular system */}
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="white"
              strokeWidth="1.15"
              opacity="0.28"
            />

            <circle
              cx="16"
              cy="16"
              r="14.2"
              stroke="white"
              strokeWidth="0.7"
              opacity="0.10"
            />
          </svg>
        </div>

        {/* Status accent */}
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
      </div>

      {/* Wordmark */}
      <div className="min-w-0 leading-none">
        <div className="flex items-baseline tracking-tight">
          <span className="font-display text-[22px] font-bold text-slate-950">
            Kap
          </span>

          <span className="bg-gradient-to-r from-[#0F6E5B] to-[#14806A] bg-clip-text font-display text-[22px] font-bold text-transparent">
            Health
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-px w-5 bg-primary/30" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Smart Healthcare
          </span>
        </div>
      </div>
    </div>
  );
}
