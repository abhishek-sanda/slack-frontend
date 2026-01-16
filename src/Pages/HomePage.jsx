import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

function getBgColor(theme) {
  if (theme === "dark") return "#181B24";
  if (theme === "reading") return "#f7ecd9";
  return "linear-gradient(135deg, #dbeafe 0%, #fff 50%, #bfdbfe 100%)";
}
function getCardColor(theme) {
  if (theme === "dark") return "#23263a";
  if (theme === "reading") return "#fffbe9";
  return "#fff";
}
function getTextColor(theme) {
  if (theme === "dark") return "#e5e7eb";
  if (theme === "reading") return "#3b2f14";
  return "#1e40af";
}
function getSubtleTextColor(theme) {
  if (theme === "dark") return "#a0aec0";
  if (theme === "reading") return "#5e4a1c";
  return "#64748b";
}

export default function HomePage() {
  const { theme } = useTheme();

  // For gradient backgrounds, we set it via style.background if not dark/reading
  const isBgGradient = theme === "light";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen transition-colors duration-300"
      style={{
        background: isBgGradient ? getBgColor(theme) : getBgColor(theme),
        backgroundColor: !isBgGradient ? getBgColor(theme) : undefined,
      }}
    >
      <div
        className="max-w-2xl w-full p-8 rounded-2xl shadow-2xl text-center"
        style={{
          backgroundColor: getCardColor(theme),
          color: getTextColor(theme),
        }}
      >
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-4"
          style={{ color: getTextColor(theme) }}
        >
          Welcome to TeamSync!
        </h1>
        <p
          className="text-lg md:text-xl mb-8"
          style={{ color: getSubtleTextColor(theme) }}
        >
          Collaborate. Chat. Schedule. Share.<br />
          The all-in-one platform for seamless team communication and productivity.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
          <Link to="/register">
            <button
              className="w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition"
              style={{
                backgroundColor: theme === "dark"
                  ? "#2563eb"
                  : theme === "reading"
                  ? "#e8d7ba"
                  : "#2563eb",
                color: theme === "reading" ? "#3b2f14" : "#fff",
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
        {/* Uncomment if you want login/other links in the future */}
        {/* <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Link to="/chat" style={{ color: getTextColor(theme) }} className="hover:underline">Team Chat</Link>
          <Link to="/meetings" style={{ color: getTextColor(theme) }} className="hover:underline">Meetings</Link>
          <Link to="/upload" style={{ color: getTextColor(theme) }} className="hover:underline">File Upload</Link>
        </div> */}
        <footer
          className="mt-8 text-sm"
          style={{ color: getSubtleTextColor(theme) }}
        >
          &copy; {new Date().getFullYear()} TeamSync. All rights reserved.
        </footer>
      </div>
    </div>
  );
}