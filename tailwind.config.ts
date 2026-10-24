import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { void: "#000000", obsidian: "#020408", cyber: "#00F0FF", pulse: "#00FF88" },
      fontFamily: { display: ["var(--font-orbitron)"], sans: ["var(--font-inter)"], mono: ["var(--font-jetbrains)"] }
    }
  },
  plugins: []
};
export default config;
