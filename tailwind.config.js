/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "border-color": "var(--border-color)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
        "hover-bg": "var(--hover-bg)",
        "shadow-color": "var(--shadow-color)",
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
        "header-bg": "var(--header-bg)",
        "sidebar-bg": "var(--sidebar-bg)",
        "sidebar-text": "var(--sidebar-text)",
        "sidebar-hover": "var(--sidebar-hover)",
        "sidebar-active": "var(--sidebar-active)",
      },
    },
  },
  plugins: [],
};
