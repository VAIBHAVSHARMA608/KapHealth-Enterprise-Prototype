export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="#0F6E5B" strokeWidth="1.5" />
        <path
          d="M5 14H10L11.5 9L15 19L16.8 14H23"
          stroke="#FF6B4A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Kap<span className="text-primary">Health</span>
      </span>
    </div>
  );
}
