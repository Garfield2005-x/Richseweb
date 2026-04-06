/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F07098",
        secondary: "#F394B8",
        "brand-light-pearl": "#F8E1EB",
        "brand-muted-silk": "#D996B3",
        "brand-charcoal": "#262626",
        "brand-elite-black": "#010000",
        "background-light": "#F8E1EB",
        "gold-accent": "#C9A961",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
