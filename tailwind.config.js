/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "var(--night)",
        grass: "var(--grass)",
        gold: "var(--gold)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        team1: "var(--team-1)",
        team2: "var(--team-2)",
        team3: "var(--team-3)",
      },
      fontFamily: {
        display: ["Anton", "Archivo Black", "system-ui", "sans-serif"],
        body: ["Outfit", "DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px var(--team-1), 0 0 48px var(--team-1)",
        card: "0 18px 50px rgba(2,6,12,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
        pop: "pop 0.3s cubic-bezier(.2,.9,.2,1)",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
