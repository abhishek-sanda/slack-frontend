import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { handleGoogleAuth } from "../services/userService";
import { useTheme } from "./ThemeContext";

function getCardBg(theme) {
  if (theme === "dark") return "rgba(35,38,58,0.93)";
  if (theme === "reading") return "rgba(255,251,233,0.96)";
  return "rgba(255,255,255,0.7)";
}
function getTextColor(theme) {
  if (theme === "dark") return "#e5e7eb";
  if (theme === "reading") return "#3b2f14";
  return "#1e40af";
}
function getInputBg(theme) {
  if (theme === "dark") return "#181B24";
  if (theme === "reading") return "#f7ecd9";
  return "#fff";
}
function getInputBorder(theme) {
  if (theme === "dark") return "#353950";
  if (theme === "reading") return "#e8d7ba";
  return "#d1d5db";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const data = await loginUser(form);
      localStorage.setItem("token", data.token);
      setMsg("Login successful! Redirecting...");
      // if (onLogin) onLogin();
      setTimeout(() => navigate("/chat"), 1200);
      
     
    } catch (err) {
      setMsg(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor:
          theme === "dark"
            ? "#181B24"
            : theme === "reading"
            ? "#f7ecd9"
            : "#f3f4f6",
      }}
    >
      {/* Moving Background Video with blur */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "blur(0.1px)", opacity: 0.6 }}
      >
        <source src="./public/Login.mov" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay to darken and further blur the background */}
      <div className="absolute inset-0 bg-black opacity-30 z-10"></div>
      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 p-12 rounded shadow w-full max-w-xl transition-colors duration-300"
        style={{
          backgroundColor: getCardBg(theme),
          color: getTextColor(theme),
        }}
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
        >
          Login
        </h2>
        {msg && (
          <div className="mb-4 text-center" style={{ color: "#dc2626" }}>
            {msg}
          </div>
        )}
        <input
          type="text"
          placeholder="Username"
          className="mb-3 w-full border p-2 rounded transition-colors duration-200"
          style={{
            backgroundColor: getInputBg(theme),
            color: getTextColor(theme),
            borderColor: getInputBorder(theme),
          }}
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
        />
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 rounded transition-colors duration-200 pr-10"
            style={{
              backgroundColor: getInputBg(theme),
              color: getTextColor(theme),
              borderColor: getInputBorder(theme),
            }}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021.9 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.364-.964M9.88 9.88a3 3 0 014.24 4.24" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364A9.956 9.956 0 0112 21c5.523 0 10-4.477 10-10 0-1.657-.403-3.22-1.125-4.575M9.88 9.88a3 3 0 014.24 4.24" /></svg>
            )}
          </button>
        </div>
        <button
          className="w-full py-2 rounded font-semibold mb-3 transition-colors duration-200"
          style={{
            backgroundColor:
              theme === "dark"
                ? "#2563eb"
                : theme === "reading"
                ? "#e8d7ba"
                : "#2563eb",
            color: theme === "reading" ? "#3b2f14" : "#fff",
          }}
        >
          Login
        </button>
        <button
          type="button"
          className="w-full py-2 rounded font-semibold mb-3 flex items-center justify-center gap-2 transition-colors duration-200"
          style={{
            backgroundColor:
              theme === "dark"
                ? "#dc2626"
                : theme === "reading"
                ? "#e8d7ba"
                : "#ef4444",
            color: theme === "reading" ? "#3b2f14" : "#fff",
          }}
          onClick={handleGoogleAuth}
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.7 1.22 9.19 3.26l6.86-6.86C35.77 2.15 30.26 0 24 0 14.84 0 6.81 5.46 2.66 13.44l8.1 6.29C12.61 12.75 17.92 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.13 24.65c0-1.61-.15-3.16-.42-4.65H24v9.09h12.38c-.53 2.84-2.15 5.26-4.55 6.89l7.05 5.48C43.89 37.23 46.13 31.42 46.13 24.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.76 28.29A14.73 14.73 0 0 1 9.5 24c0-1.49.25-2.93.69-4.29l-8.12-6.32A24.01 24.01 0 0 0 0 24c0 3.76.91 7.32 2.54 10.46l8.22-6.17z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.26 0 11.52-2.07 15.36-5.62l-7.05-5.48c-2.04 1.37-4.65 2.18-8.31 2.18-6.08 0-11.26-4.09-13.12-9.62l-8.21 6.17C6.8 42.54 14.84 48 24 48z"
              />
            </g>
          </svg>
          Login with Google
        </button>
        <div className="text-center" style={{ color: getTextColor(theme) }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="hover:underline"
            style={{
              color: theme === "reading" ? "#8b5c10" : "#2563eb",
              fontWeight: "bold",
            }}
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}