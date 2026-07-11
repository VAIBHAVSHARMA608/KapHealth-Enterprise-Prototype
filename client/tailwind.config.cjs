/** KapHealth brand tokens -- see README "Design system" section for rationale. */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10241F",
        muted: "#6B8079",
        surface: "#F7F9F6",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#0F6E5B",
          dark: "#0A4F42",
          light: "#E4F2EE",
        },
        accent: {
          DEFAULT: "#FF6B4A",
          dark: "#E5502C",
          light: "#FFE7E0",
        },
        line: "#DCE6E2",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
