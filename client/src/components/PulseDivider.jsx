/**
 * KapHealth's signature element: an ECG pulse line that resolves into a
 * checkmark. Used as a section divider throughout the app (instead of a
 * plain hairline) to encode the product's real arc -- vital signs in,
 * confirmed outcome out -- and reused as a loading motif during
 * booking/payment transitions.
 */
export default function PulseDivider({ className = "", animated = false }) {
  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 40" width="100%" height="40" preserveAspectRatio="none">
        <path
          d="M0 20 H210 L225 6 L240 34 L255 20 H320 L335 4 L352 20 H420 L432 12 L444 28 L456 20 H600"
          fill="none"
          stroke="#0F6E5B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "pulse-path" : ""}
          opacity="0.85"
        />
        <path
          d="M470 20 L490 32 L522 4"
          fill="none"
          stroke="#FF6B4A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {animated && (
        <style>{`
          .pulse-path { stroke-dasharray: 700; stroke-dashoffset: 700; animation: kap-draw 1.6s ease forwards; }
          @keyframes kap-draw { to { stroke-dashoffset: 0; } }
          @media (prefers-reduced-motion: reduce) { .pulse-path { animation: none; stroke-dashoffset: 0; } }
        `}</style>
      )}
    </div>
  );
}
