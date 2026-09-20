import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ---- Strict dark palette ---- */
        base: "#000000", // page background — true black
        elevated: "#070809", // raised sections
        surface: "#0B0C0E", // cards — darkest neutral grey
        line: "#1A1D23", // hairline borders
        "line-strong": "#2E333C",

        /* ---- Monochrome neon (was RGB) ----
           Every hue slot now maps to white/grey at that role's relative
           strength, so the whole UI flips to a single white channel while
           keeping its old contrast hierarchy: cyan/magenta are the strong
           accents, indigo/purple the soft secondary, emerald stays green
           (status semantics) but desaturated. */
        neon: {
          cyan: "#FFFFFF",
          teal: "#F2F4F6",
          sky: "#E8ECF0",
          blue: "#DDE2E8",
          indigo: "#AEB6BF",
          purple: "#AEB6BF",
          magenta: "#FFFFFF",
          pink: "#DDE2E8",
          emerald: "#6FE39C",
        },

        /* ---- Text ramp (WCAG-checked on #07090E) ---- */
        ink: {
          hi: "#FFFFFF", // headings   21:1
          mid: "#CBD5E1", // body       14.3:1
          low: "#94A3B8", // secondary  8.9:1
          faint: "#64748B", // meta       4.9:1
        },
      },
      zIndex: {
        backdrop: "0",
        stage: "20",
        content: "20",
        copy: "30",
        overlay: "60",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 30px -8px rgba(255, 255, 255, 0.5)",
        "glow-magenta": "0 0 30px -8px rgba(255, 255, 255, 0.4)",
        "glow-purple": "0 0 30px -8px rgba(255, 255, 255, 0.3)",
        card: "0 24px 70px -35px rgba(0, 0, 0, 1)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { transform: "translateX(-120%)" }, "100%": { transform: "translateX(220%)" } },
        "drift-a": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(6%,-8%,0) scale(1.12)" },
          "66%": { transform: "translate3d(-5%,6%,0) scale(0.94)" },
        },
        "drift-b": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-8%,7%,0) scale(0.9)" },
        },
        /* Animating `filter: blur()` repaints a huge layer every frame — one of
           the most expensive things on phones. The glow's blur is applied once
           as a static class; the animation only moves opacity + scale, which
           stay on the compositor. */
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", transform: "scale(0.97)" },
          "50%": { opacity: "0.9", transform: "scale(1.04)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "float-y": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        "icon-pulse": {
          "0%,100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
          "50%": { transform: "scale(1.09)", filter: "drop-shadow(0 0 7px rgba(255,255,255,0.7))" },
        },
        "gradient-pan": { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        /* Console panel bobbing — slow, never distracting. */
        bob: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(-0.35deg)" },
        },
        /* Live DB link indicator. */
        "blink-soft": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.25" } },
        /* Vertical scan line sweeping the console. */
        "scan-y": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "12%,88%": { opacity: "1" },
          "100%": { transform: "translateY(1200%)", opacity: "0" },
        },
        /* Data bars in the console idling. */
        "bar-idle": {
          "0%,100%": { transform: "scaleY(0.45)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up .6s ease-out both",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        "drift-a": "drift-a 24s ease-in-out infinite",
        "drift-b": "drift-b 30s ease-in-out infinite",
        "pulse-glow": "pulse-glow 7s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "float-y": "float-y 4.5s ease-in-out infinite",
        "icon-pulse": "icon-pulse 3.2s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s ease-in-out infinite",
        bob: "bob 7s ease-in-out infinite",
        "blink-soft": "blink-soft 1.8s ease-in-out infinite",
        "scan-y": "scan-y 5.5s linear infinite",
        "bar-idle": "bar-idle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
