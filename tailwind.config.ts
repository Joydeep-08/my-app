import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Custom Design System Palette ──────────────────────────────
        // Usage: bg-sage, text-skyblue, border-lavender, etc.
        // Each color also has .light and .dark shades: bg-sage-light, bg-sage-dark

        sage: {
          DEFAULT: "#87A878", // Muted green — primary accent, CTAs, highlights
          light: "#A3BF96",   // Lighter tint — hover states, subtle backgrounds
          dark:  "#6B8F5E",   // Deeper shade — pressed states, borders
        },

        skyblue: {
          DEFAULT: "#6BA3BE", // Calm blue — links, info states, secondary accents
          light: "#8DBDD4",   // Lighter tint — hover, tags, badges
          dark:  "#4F87A2",   // Deeper shade — active states, icons
        },

        lavender: {
          DEFAULT: "#B8A9C9", // Soft purple — decorative, tags, accents
          light: "#CFC4DC",   // Lighter tint — backgrounds, dividers
          dark:  "#9B89B4",   // Deeper shade — text on light bg, borders
        },

        cream: {
          DEFAULT: "#FAF3E0", // Warm off-white — primary page background
          light: "#FEFAF2",   // Near-white — cards, modals on cream bg
          dark:  "#F0E5C4",   // Warmer cream — section dividers, alt backgrounds
        },

        dark: {
          DEFAULT: "#2D2D2D", // Near-black — body text, headings
          light:  "#444444",  // Softer dark — secondary text, icons
          darker: "#1A1A1A",  // True dark — footers, overlays
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;