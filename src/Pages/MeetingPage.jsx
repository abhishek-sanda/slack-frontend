import React, { useEffect, useState } from "react";
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../services/meetingService";
import { useTheme } from "./ThemeContext";
import { analyzeSentiment } from "../services/sentimentService"; // Import the sentiment analysis function

// Utility for formatting date/time
function formatDateTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Theme-based helpers
function getBgColor(theme) {
  if (theme === "dark") return "#181B24";
  if (theme === "reading") return "#f7ecd9";
  return "#fff";
}
function getCardColor(theme) {
  if (theme === "dark") return "#23263a";
  if (theme === "reading") return "#fffbe9";
  return "#fff";
}
function getTextColor(theme) {
  if (theme === "dark") return "#e5e7eb";
  if (theme === "reading") return "#3b2f14";
  return "#1f2937";
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

// Add/Edit modal (shared for both)
function MeetingModal({ open, onClose, onSave, initialData, isEdit, theme }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [time, setTime] = useState(
    initialData?.time
      ? new Date(initialData.time).toISOString().slice(0, 16)
      : ""
  );
  const [participants, setParticipants] = useState(
    initialData?.participants ? initialData.participants.join(", ") : ""
  );
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setTime(
        initialData?.time
          ? new Date(initialData.time).toISOString().slice(0, 16)
          : ""
      );
      setParticipants(
        initialData?.participants ? initialData.participants.join(", ") : ""
      );
      setSummary(initialData?.summary || "");
      setError("");
      setSubmitting(false);
    }
  }, [open, initialData]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !time.trim() || !participants.trim()) {
      setError("Title, time, and participants are required.");
      return;
    }
    setSubmitting(true);
    onSave({
      title: title.trim(),
      time,
      participants: participants
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      summary: summary.trim(),
    })
      .then(() => {
        onClose();
      })
      .catch(() => setError("Failed to save meeting."))
      .finally(() => setSubmitting(false));
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div
        className="rounded-lg shadow-lg w-full max-w-md p-6 relative transition-colors duration-300"
        style={{
          backgroundColor: getCardColor(theme),
          color: getTextColor(theme),
        }}
      >
        <button
          className="absolute top-2 right-2 hover:text-blue-600"
          style={{ color: getTextColor(theme) }}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Meeting" : "Add Meeting"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2 transition-colors duration-200"
              style={{
                backgroundColor: getInputBg(theme),
                color: getTextColor(theme),
                borderColor: getInputBorder(theme),
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Time</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2 transition-colors duration-200"
              style={{
                backgroundColor: getInputBg(theme),
                color: getTextColor(theme),
                borderColor: getInputBorder(theme),
              }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Participants{" "}
              <span className="font-normal text-xs text-gray-400">
                (comma-separated)
              </span>
            </label>
            <input
              className="w-full border rounded px-3 py-2 transition-colors duration-200"
              style={{
                backgroundColor: getInputBg(theme),
                color: getTextColor(theme),
                borderColor: getInputBorder(theme),
              }}
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              required
              disabled={submitting}
              placeholder="alice, bob, carol"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Summary{" "}
              <span className="text-xs text-gray-400 font-normal">
                (optional)
              </span>
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 transition-colors duration-200"
              style={{
                backgroundColor: getInputBg(theme),
                color: getTextColor(theme),
                borderColor: getInputBorder(theme),
              }}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              disabled={submitting}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full rounded font-semibold transition-colors duration-200"
            style={{
              backgroundColor:
                theme === "dark"
                  ? "#2563eb"
                  : theme === "reading"
                  ? "#e8d7ba"
                  : "#2563eb",
              color: theme === "reading" ? "#3b2f14" : "#fff",
              opacity: submitting ? 0.7 : 1,
            }}
            disabled={submitting}
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
              ? "Save Meeting"
              : "Add Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Card for each meeting, with Edit/Delete
function MeetingCard({ meeting, onEdit, onDelete, theme }) {
  return (
    <li
      className="border p-4 rounded-lg hover:shadow transition relative"
      style={{
        backgroundColor: theme === "dark"
          ? "#23263a"
          : theme === "reading"
          ? "#fffbe9"
          : "#f9fafb",
        borderColor: theme === "dark"
          ? "#353950"
          : theme === "reading"
          ? "#e8d7ba"
          : "#e5e7eb",
        color: getTextColor(theme),
      }}
    >
      <div className="mb-1 text-lg font-semibold flex items-center gap-2">
        <span
          style={{
            color: theme === "dark"
              ? "#60a5fa"
              : theme === "reading"
              ? "#915c06"
              : "#2563eb"
          }}
        >
          {meeting.title}
        </span>
        <span className="text-xs font-normal" style={{ color: "#a0aec0" }}>
          &mdash; {formatDateTime(meeting.time)}
        </span>
      </div>
      <div className="mb-1 text-sm">
        <span className="font-medium">Participants:</span>{" "}
        {meeting.participants && meeting.participants.length > 0
          ? meeting.participants.join(", ")
          : <span className="italic text-gray-400">None</span>
        }
      </div>
      <div className="text-sm">
        <span className="font-medium">Summary:</span>{" "}
        {meeting.summary
          ? meeting.summary
          : <span className="italic text-gray-400">Not yet summarized</span>
        }
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          className="hover:underline text-sm"
          style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
          onClick={() => onEdit(meeting)}
        >
          Edit
        </button>
        <button
          className="hover:underline text-sm"
          style={{ color: theme === "dark" ? "#f87171" : "#dc2626" }}
          onClick={() => onDelete(meeting)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function MeetingPage() {
  const { theme } = useTheme();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [sentiment, setSentiment] = useState(""); // State for sentiment analysis
  const [transcriptText, setTranscriptText] = useState(""); // State for transcript text

  useEffect(() => {
    setLoading(true);
    fetchMeetings()
      .then(setMeetings)
      .catch(() => setError("Failed to fetch meetings."))
      .finally(() => setLoading(false));
  }, []);

  // Add new meeting to top of list
  function handleMeetingCreated(meeting) {
    setMeetings((prev) => [meeting, ...prev]);
  }

  // Update meeting in state
  function handleMeetingUpdated(updated) {
    setMeetings((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m))
    );
  }

  // Delete meeting in state
  function handleMeetingDeleted(deletedId) {
    setMeetings((prev) => prev.filter((m) => m._id !== deletedId));
  }

  function handleEdit(meeting) {
    setEditMeeting(meeting);
    setModalOpen(true);
  }

  async function handleDelete(meeting) {
    if (
      window.confirm(
        `Are you sure you want to delete the meeting "${meeting.title}"?`
      )
    ) {
      try {
        await deleteMeeting(meeting._id);
        handleMeetingDeleted(meeting._id);
      } catch {
        alert("Failed to delete meeting.");
      }
    }
  }

  const handleAnalyzeSentiment = async () => {
    setSentiment("Analyzing...");
    const result = await analyzeSentiment(transcriptText);
    setSentiment(result);
  };

  return (
    <div
      className="max-w-2xl mx-auto mt-10 p-6 shadow-lg rounded-lg transition-colors duration-300"
      style={{
        backgroundColor: getCardColor(theme),
        color: getTextColor(theme),
      }}
    >
      <MeetingModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditMeeting(null);
        }}
        isEdit={!!editMeeting}
        initialData={editMeeting}
        onSave={async (meetingData) => {
          if (editMeeting) {
            // Edit
            const updated = await updateMeeting(editMeeting._id, meetingData);
            handleMeetingUpdated(updated);
          } else {
            // Create
            const created = await createMeeting(meetingData);
            handleMeetingCreated(created);
          }
        }}
        theme={theme}
      />
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
        >
          Scheduled Meetings
        </h2>
        <button
          className="px-4 py-2 rounded font-semibold transition-colors duration-200"
          style={{
            backgroundColor:
              theme === "dark"
                ? "#2563eb"
                : theme === "reading"
                ? "#e8d7ba"
                : "#2563eb",
            color: theme === "reading" ? "#3b2f14" : "#fff",
          }}
          onClick={() => {
            setEditMeeting(null);
            setModalOpen(true);
          }}
        >
          + Add Meeting
        </button>
      </div>
      {loading && (
        <div className="text-gray-400 italic text-center py-8">
          Loading meetings...
        </div>
      )}
      {error && (
        <div className="text-red-500 italic text-center py-8">{error}</div>
      )}
      {!loading && !error && (
        <ul className="space-y-4">
          {meetings.length === 0 ? (
            <li className="text-gray-400 italic text-center py-8">
              No meetings scheduled.
            </li>
          ) : (
            meetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                onEdit={handleEdit}
                onDelete={handleDelete}
                theme={theme}
              />
            ))
          )}
        </ul>
      )}
      {/* Sentiment Analysis Section */}
      <div className="bg-white rounded shadow p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
        <textarea
          className="w-full border rounded px-3 py-2 mb-2"
          rows={3}
          value={transcriptText}
          onChange={(e) => setTranscriptText(e.target.value)}
          placeholder="Enter transcript text here..."
          style={{
            backgroundColor: getInputBg(theme),
            color: getTextColor(theme),
            borderColor: getInputBorder(theme),
          }}
        />
        <button
          onClick={handleAnalyzeSentiment}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Analyze Sentiment
        </button>
        <pre className="mt-2 whitespace-pre-wrap">{sentiment}</pre>
      </div>
    </div>
  );
}