export default function PulseDivider({
  className = "",
  animated = false,
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 80"
        width="100%"
        height="60"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="pulseGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>

          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Line */}

        <path
          d="M0 40 H1200"
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        {/* ECG */}

        <path
          d="
          M0 40
          H220
          L245 15
          L270 65
          L295 40
          H430
          L455 8
          L485 40
          H650
          L675 20
          L700 58
          L725 40
          H880
          L905 28
          L930 50
          L955 40
          H1200
          "
          fill="none"
          stroke="url(#pulseGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pulseGlow)"
          className={animated ? "kap-pulse" : ""}
        />

        {/* Check Mark */}

        <path
          d="M1010 40 L1040 60 L1085 15"
          fill="none"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {animated && (
        <style>{`
          .kap-pulse{
            stroke-dasharray:1600;
            stroke-dashoffset:1600;
            animation:drawPulse 2s ease forwards;
          }

          @keyframes drawPulse{
            to{
              stroke-dashoffset:0;
            }
          }

          @media(prefers-reduced-motion:reduce){
            .kap-pulse{
              animation:none;
              stroke-dashoffset:0;
            }
          }
        `}</style>
      )}
    </div>
  );
}