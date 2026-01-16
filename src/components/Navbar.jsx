import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";


export default function Navbar({ onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


  return (
    <nav className="w-full bg-blue-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight hover:text-blue-200 transition-colors"
        >
          Home
        </Link>

        {/* Menu links */}
        <div className="flex flex-wrap items-center space-x-4 sm:space-x-6 mt-2 sm:mt-0">
          <Link
            to="/meetings"
            className="hover:text-blue-200 font-medium transition-colors"
          >
            Meetings
          </Link>
          <Link
            to="/chat"
            className="hover:text-blue-200 font-medium transition-colors"
          >
            Chat
          </Link>
          <Link
            to="/upload"
            className="hover:text-blue-200 font-medium transition-colors"
          >
            Upload
          </Link>
          <Link
            to="/about"
            className="hover:text-blue-200 font-medium transition-colors"
          >
            About
          </Link>

        
          <Link
            to="/theme"
            className="hover:text-blue-200 font-medium transition-colors"
          >
            Theme
          </Link>
        </div>

        {/* User avatar and logout/login */}
        <div className="flex items-center space-x-2 sm:space-x-4 ml-0 sm:ml-6 mt-2 sm:mt-0">
          <ThemeSwitcher className="ml-2 px-3 py-1 rounded-lg border border-blue-300 hover:bg-blue-600 transition-colors" />
          <button
            onClick={() => {
              localStorage.removeItem("token");
              if (onLogout) onLogout();
              navigate("/login");
            }}
            className="ml-2 px-3 py-1 rounded-lg border border-red-300 bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      

      {/* Dropdown for Meetings */}
      <div className="relative mt-2 sm:mt-0">
        <button
          onClick={() => setOpen(!open)}
          className="text-white px-3 py-2 rounded hover:bg-gray-700 focus:outline-none"
        >
          Meeting-service ▼
        </button>
        {open && (
          <div
            className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-10"
            onMouseLeave={() => setOpen(false)}
          >
          <button
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              const meetingId = prompt("Enter Meeting ID to join:");
              if (meetingId) {
                window.location.href = `/joinmeeting/${meetingId}`;
              }
            }}
          >
            Join Meeting
          </button>
          <button
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              const meetingId = prompt("Enter Meeting ID to join:");
              if (meetingId) {
                window.location.href = `/meetingroom/${meetingId}`;
              }
            }}
          >
            Meeting Room
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              const meetingId = prompt("Enter Meeting ID to join:");
              if (meetingId) {
                window.location.href = `/hostmeeting/${meetingId}`;
              }
            }}
          >
            Host Meeting view
          </button>
          <Link
            to="/createmeeting"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={() => setOpen(false)}>
            Create Meeting
            </Link>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}
