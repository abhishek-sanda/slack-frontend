import React from "react";
import { useTheme } from "./ThemeContext";

function getBgColor(theme) {
  if (theme === "dark") return "#181B24";
  if (theme === "reading") return "#f7ecd9";
  return "#fff";
}
function getTextColor(theme) {
  if (theme === "dark") return "#e5e7eb";
  if (theme === "reading") return "#3b2f14";
  return "#1f2937";
}
function getSubtleTextColor(theme) {
  if (theme === "dark") return "#cbd5e1";
  if (theme === "reading") return "#5e4a1c";
  return "#555";
}
function getCardBgColor(theme) {
  if (theme === "dark") return "#23263a";
  if (theme === "reading") return "#fffbe9";
  return "#fff";
}

export default function AboutPage() {
  const { theme } = useTheme();
  const textColor = getTextColor(theme);
  const subtleTextColor = getSubtleTextColor(theme);

  return (
    <div
      className="max-w-2xl mx-auto rounded-lg shadow p-8 mt-8 transition-colors duration-300"
      style={{
        backgroundColor: getCardBgColor(theme),
        color: textColor,
      }}
    >
      <h1
        className="text-3xl font-bold mb-4 text-center"
        style={{ color: theme === "reading" ? "#3b2f14" : theme === "dark" ? "#60a5fa" : "#2563eb" }}
      >
        About Us
      </h1>
      <p
        className="mb-6 text-lg text-center"
        style={{ color: subtleTextColor }}
      >
        Welcome to our platform! We aim to deliver a modern, secure, and user-friendly experience for managing your online profile and personal information.
      </p>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme === "reading" ? "#915c06" : "#2563eb" }}>
          Our Mission
        </h2>
        <p style={{ color: subtleTextColor }}>
          Our mission is to empower users with a seamless way to create, update, and manage their digital presence. We focus on privacy, security, and usability, ensuring your data is safe and easy to control.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme === "reading" ? "#915c06" : "#2563eb" }}>
          Technology Stack
        </h2>
        <ul className="list-disc list-inside" style={{ color: subtleTextColor }}>
          <li>Frontend: React, Tailwind CSS</li>
          <li>Backend: Node.js, Express.js, MongoDB</li>
          <li>Authentication: JWT (JSON Web Tokens)</li>
          <li>APIs: RESTful endpoints</li>
          <li>Hosting: Vercel / Heroku / Render (customizable)</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme === "reading" ? "#915c06" : "#2563eb" }}>
          Meet the Team
        </h2>
        <ul className="list-disc list-inside" style={{ color: subtleTextColor }}>
          <li><strong>Abhishek Kumar</strong> – Full Stack Developer</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme === "reading" ? "#915c06" : "#2563eb" }}>
          Contact Us
        </h2>
        <p style={{ color: subtleTextColor }}>
          Have questions or feedback? Reach out to us at{' '}
          <a
            href="mailto:abhisheksakraudha@gmail.com"
            className="underline"
            style={{ color: theme === "reading" ? "#3b2f14" : "#2563eb" }}
          >
            Gmail
          </a>
        </p>
      </section>
      <section className="mb-2 text-center">
        <h2 className="text-lg font-semibold mb-2" style={{ color: theme === "reading" ? "#915c06" : "#2563eb" }}>
          Open Source
        </h2>
        <p style={{ color: subtleTextColor }}>
          This project is open source. Check out our{" "}
          <a
            href="https://github.com/Abhi-8676/your-repo"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme === "reading" ? "#3b2f14" : "#2563eb" }}
          >
            GitHub repository
          </a>{" "}
          to contribute or report issues.
        </p>
      </section>
      <p
        className="text-sm mt-6 text-center"
        style={{ color: theme === "reading" ? "#a28338" : "#9ca3af" }}
      >
        © {new Date().getFullYear()} TeamSync. All rights reserved.
      </p>
    </div>
  );
}