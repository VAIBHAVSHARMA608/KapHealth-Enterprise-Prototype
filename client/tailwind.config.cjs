/**
 * KapHealth brand tokens.
 *
 * Reskinned to the dark glassmorphism system: canvas/card/border/text tokens
 * now point at the dark palette (Slate-950 canvas, translucent Slate-900
 * cards, Emerald/Mint accents) instead of renaming every className across
 * the app -- `bg-surface`, `text-ink`, `border-line`, `bg-primary-light` +
 * `text-primary-dark`, etc. all "just work" with the new look everywhere
 * they're already used.
 */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces
        surface: "#020617", // Slate-950 -- page background
        card: "#0f172a", // Slate-900 -- card background (used with /65 opacity for glass)
        line: "#1e293b", // Slate-800 -- borders/dividers

        // Text
        ink: "#f8fafc", // Slate-50 -- headings/primary text (was near-black, now near-white)
        muted: "#94a3b8", // Slate-400 -- secondary/metadata text

        // Brand -- Clinical Emerald / Mint
        primary: {
          DEFAULT: "#10b981", // Emerald-500
          dark: "#34d399", // Mint-400 -- used as the readable text variant on primary-light chips
          light: "#0d2e26", // translucent-emerald-tinted dark surface, for badge/pill backgrounds
        },

        // Accent -- Rose (urgent / energetic CTAs, matches the old "coral" role)
        accent: {
          DEFAULT: "#f43f5e", // Rose-500
          dark: "#e11d48", // Rose-600
          light: "#3f1522", // translucent-rose-tinted dark surface
        },

        // Telemetry / status semantics (new -- for badges, pulses, alerts)
        status: {
          pending: "#fbbf24", // Amber-400
          urgent: "#f43f5e", // Rose-500
          active: "#38bdf8", // Sky-400
          success: "#34d399", // Mint-400
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.37)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
