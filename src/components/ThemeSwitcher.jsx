import React from "react";
import { useTheme } from "../Pages/ThemeContext";

const themeLabels = {
  light: "☀️ Light",
  dark: "🌙 Dark",
  reading: "📖 Reading"
};

export default function ThemeSwitcher({ className = "" }) {
  const { theme, nextTheme } = useTheme();
  return (
    <button
      className={`flex items-center gap-2 px-3 py-1 rounded font-semibold border border-blue-200 hover:bg-blue-50 transition ${className}`}
      style={{
        background: theme === "dark" ? "#23263a" : theme === "reading" ? "#fffbe9" : "#fff",
        color: theme === "dark" ? "#93c5fd" : theme === "reading" ? "#8b5c10" : "#2563eb"
      }}
      onClick={nextTheme}
      title="Switch theme"
      type="button"
    >
      {themeLabels[theme] || "Theme"}
    </button>
  );
}