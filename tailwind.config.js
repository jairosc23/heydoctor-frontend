/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#078A92",
        primaryDark: "#022C2C",
        primaryMid: "#05636B",
        primaryLight: "#E6F7F8",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.05)",
        premium: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
