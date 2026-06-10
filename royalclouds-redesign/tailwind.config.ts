import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101428",
        royal: {
          50: "#eef7ff",
          100: "#d9eeff",
          300: "#7cc9ff",
          500: "#1e9dff",
          600: "#0878d7",
          700: "#075fab",
          900: "#09274c"
        },
        sun: "#ffb629",
        mint: "#4ee3b4",
        violet: "#7c4dff"
      },
      boxShadow: {
        glow: "0 24px 90px rgba(30,157,255,.28)",
        card: "0 18px 60px rgba(9,39,76,.12)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Sora", "Inter", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(78,227,180,.35), transparent 28rem), radial-gradient(circle at top right, rgba(30,157,255,.42), transparent 32rem), linear-gradient(135deg, #09274c 0%, #101428 58%, #211444 100%)"
      }
    }
  },
  plugins: []
};

export default config;
