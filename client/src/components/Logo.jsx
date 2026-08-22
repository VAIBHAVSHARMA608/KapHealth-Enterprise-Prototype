export default function Logo({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
    >
      {/* Logo */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20">

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 12H8L10 7L14 17L16 12H21"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.25"
          />
        </svg>

      </div>

      {/* Brand */}

      <div className="leading-tight">

        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">

          Kap
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Health
          </span>

        </h1>

        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
          Smart Healthcare
        </p>

      </div>
    </div>
  );
}