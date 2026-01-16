// Enhanced CreateMeeting.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createMeeting, startMeeting } from "../services/Meeting-service";
import { FiCopy, FiShare2 } from "react-icons/fi";

export default function CreateMeeting() {
  const [formData, setFormData] = useState({
    host: "",
    title: "",
    requiresApproval: true
  });
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [hostToken, setHostToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.host.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await createMeeting(formData);
      const fullLink = `${window.location.origin}/meeting/${data.meetingId}`;
      setMeetingLink(fullLink);
      setMeetingId(data.meetingId);
      setHostToken(data.token); // Save host token for starting meeting
      // Auto-copy to clipboard if the API supports it
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create meeting");
      console.error("Create meeting error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({
        title: formData.title || "Join my meeting",
        text: `${formData.host} has invited you to a meeting`,
        url: meetingLink
      });
    } catch (err) {
      console.error("Failed to share:", err);
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Meeting</h2>
          <p className="text-gray-600 mb-6">Set up your meeting in seconds</p>
          
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <div>
                <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  id="host"
                  name="host"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.host}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title (optional)
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Team Standup, Client Call, etc."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="requiresApproval"
                  name="requiresApproval"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.requiresApproval}
                  onChange={handleInputChange}
                />
                <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-700">
                  Require approval to join
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !formData.host.trim()}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || !formData.host.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Meeting"
                )}
              </button>
            </div>
          </form>

          {meetingLink && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Your meeting is ready!</h3>
              
              <div className="flex items-center space-x-2 mb-4">
                <input
                  ref={linkRef}
                  type="text"
                  readOnly
                  value={meetingLink}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                  onClick={() => linkRef.current.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  <FiCopy className="h-5 w-5" />
                </button>
                {navigator.share && (
                  <button
                    onClick={shareLink}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                    title="Share link"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {copied && (
                <div className="text-sm text-green-600 mb-2">
                  Link copied to clipboard!
                </div>
              )}

              <button
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    if (meetingId && hostToken) {
                      await startMeeting(meetingId, hostToken);
                    }
                    navigate(`/meeting/${meetingId}`);
                  } catch (err) {
                    setError("Failed to start meeting. Please try again.");
                    console.error("Failed to start meeting:", err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md text-white ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  "Join Meeting Now"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


