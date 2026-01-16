import React, { useEffect, useState } from "react";

const themes = {
  light: "light",
  dark: "dark",
  reading: "reading",
};

const themeLabels = {
  light: { icon: "☀️", label: "White" },
  dark: { icon: "🌙", label: "Night" },
  reading: { icon: "📖", label: "Reading" },
};

// Helper to get background color for each mode
function getBgColor(theme) {
  if (theme === "dark") return "#181B24";           // Night: very dark gray-blue
  if (theme === "reading") return "#f7ecd9";        // Reading: sepia
  return "#fff";                                    // White: pure white
}
// Helper to get text color for each mode
function getTextColor(theme) {
  if (theme === "dark") return "#e5e7eb";           // Night: light gray
  if (theme === "reading") return "#3b2f14";        // Reading: dark brown
  return "#1f2937";                                 // White: dark gray
}

export default function ThemePage() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || themes.light);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "reading");
    if (theme === themes.dark) {
      document.documentElement.classList.add("dark");
    } else if (theme === themes.reading) {
      document.documentElement.classList.add("reading");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const nextTheme = () => {
    if (theme === themes.light) return setTheme(themes.dark);
    if (theme === themes.dark) return setTheme(themes.reading);
    return setTheme(themes.light);
  };

  // Dynamic background and text color styles
  const bgColor = getBgColor(theme);
  const textColor = getTextColor(theme);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div
        className="w-full max-w-md px-8 py-10 rounded-xl shadow-lg flex flex-col items-center"
        style={{
          backgroundColor: theme === "light" ? "#fff"
            : theme === "dark" ? "#23263a"
            : "#f7ecd9",
          color: textColor,
        }}
      >
        <h1 className="text-3xl font-bold mb-6" style={{ color: textColor }}>
          Theme Settings
        </h1>
        <p className="mb-6 text-lg text-center" style={{ color: textColor }}>
          Easily switch between <span className="font-semibold">White</span>, <span className="font-semibold">Night</span>, and <span className="font-semibold">Reading</span> modes for the best reading experience. Your preference is saved for next time!
        </p>
        <button
          aria-label="Toggle theme"
          onClick={nextTheme}
          className="rounded px-6 py-3 text-lg font-semibold shadow mb-6 transition"
          style={{
            backgroundColor: theme === "light"
              ? "#2563eb"
              : theme === "dark"
              ? "#23263a"
              : "#e8d7ba",
            color: theme === "reading"
              ? "#3b2f14"
              : "#fff",
            border: "none",
          }}
        >
          {themeLabels[theme].icon} Switch to {themeLabels[
            theme === "light" ? "dark" : theme === "dark" ? "reading" : "light"
          ].label} Mode
        </button>
        <div className="flex gap-4 mt-2">
          {Object.entries(themes).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition border shadow`}
              style={{
                backgroundColor:
                  theme === value
                    ? "#2563eb"
                    : value === "light"
                    ? "#f3f4f6"
                    : value === "dark"
                    ? "#23263a"
                    : "#f2e3c9",
                color:
                  theme === value
                    ? "#fff"
                    : value === "reading"
                    ? "#3b2f14"
                    : value === "dark"
                    ? "#e5e7eb"
                    : "#1f2937",
                borderColor: theme === value ? "#2563eb" : "#d1d5db",
              }}
              aria-current={theme === value ? "page" : undefined}
            >
              <span>{themeLabels[value].icon}</span>
              <span className="hidden sm:inline">{themeLabels[value].label}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center" style={{ color: "#9ca3af" }}>
          Theme preference is saved in your browser.
        </div>
      </div>
    </div>
  );
}