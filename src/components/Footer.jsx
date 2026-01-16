import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0 text-center md:text-left">
          <span className="font-semibold text-lg text-gray-100">Teams App</span>
          <span className="ml-2 text-sm text-gray-400">&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex space-x-4">
          <a 
            href="https://github.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            GitHub
          </a>
          <a 
            href="/privacy" 
            className="hover:text-blue-400 transition"
          >
            Privacy
          </a>
          <a 
            href="/contact" 
            className="hover:text-blue-400 transition"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}