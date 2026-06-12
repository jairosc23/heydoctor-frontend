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
        hd: {
          surface: {
            base: "#f4f7f8",
            chrome: "#ffffff",
            raised: "#ffffff",
            muted: "#f8fafb",
          },
          border: {
            subtle: "#e8eef0",
            default: "#dfe6e8",
          },
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "hd-sm": "0.5rem",
        "hd-md": "0.75rem",
        "hd-lg": "1rem",
        "hd-xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.05)",
        premium: "0 10px 30px rgba(0,0,0,0.08)",
        "hd-1": "0 1px 2px rgba(2, 44, 44, 0.05)",
        "hd-2": "0 2px 10px rgba(2, 44, 44, 0.06)",
        "hd-3": "0 8px 24px rgba(2, 44, 44, 0.08)",
        "hd-focus": "0 12px 32px rgba(7, 138, 146, 0.12)",
      },
      spacing: {
        "hd-1": "0.25rem",
        "hd-2": "0.5rem",
        "hd-3": "0.75rem",
        "hd-4": "1rem",
        "hd-5": "1.25rem",
        "hd-6": "1.5rem",
      },
      transitionDuration: {
        "hd-fast": "150ms",
        "hd-base": "200ms",
        "hd-slow": "250ms",
      },
    },
  },
  plugins: [],
};
