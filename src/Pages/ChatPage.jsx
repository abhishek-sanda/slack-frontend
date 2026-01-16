// import React, { useState, useEffect } from "react";
// import { useChat } from "../services/chatService";

// export default function ChatPage() {
//   const { messages, sendMessage } = useChat();
//   const [input, setInput] = useState("");

//   const handleSend = () => {
//     if (input.trim()) {
//       sendMessage(input);
//       setInput("");
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-2">Team Chat</h2>
//       <div className="border h-80 overflow-y-scroll p-2 bg-white rounded">
//         {messages.map((msg, idx) => (
//           <div key={idx} className="mb-1">
//             <b>{msg.user}:</b> {msg.text}
//           </div>
//         ))}
//       </div>
//       <div className="mt-2 flex">
//         <input
//           className="flex-1 border rounded p-2"
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           placeholder="Type your message"
//         />
//         <button
//           className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={handleSend}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
const API = import.meta.env.VITE_CHAT_API_URL || "http://localhost:4001/api";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useChat } from "../services/chatService";
import { useTheme } from "./ThemeContext";
import { summarizeChat, getSmartReplies } from "../services/aiService";

// Utility functions for theme-based styles
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
function getInputColor(theme) {
  if (theme === "dark") return "#353950";
  if (theme === "reading") return "#f2e3c9";
  return "#fff";
}

export default function ChatPage() {
  const { theme } = useTheme();
  const { messages, sendMessage, editMessage, deleteMessage, pinMessage, reactMessage } = useChat();
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [summary, setSummary] = useState("");
  const [smartReplies, setSmartReplies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // <-- For reply feature
  const [attachments, setAttachments] = useState([]); // <-- For file uploads
  const [uploading, setUploading] = useState(false);

  // Get username from localStorage/sessionStorage
  useEffect(() => {
    const user =
      localStorage.getItem("username") ||
      sessionStorage.getItem("username") ||
      "";
    setUsername(user);
  }, []);

  // File upload handler (mock upload, replace with real API as needed)
  const handleFileChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      setUploading(true);
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await axios.post(`${API}/chat/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
          
          const data = res.data;
          return {
            url: data.url,
            type: data.type && data.type.startsWith("image") ? "image" : "file",
            name: data.name,
          };
        })
      );
      setAttachments(uploaded.filter(Boolean));
      setUploading(false);
    } catch (err) {
      setUploading(false);
      alert("Unexpected error during file upload");
      console.error("File upload error:", err);
    }
  };

  const handleSend = () => {
    if (input.trim() || attachments.length > 0) {
      sendMessage(input, username, undefined, replyTo ? replyTo._id : undefined, attachments);
      setInput("");
      setReplyTo(null);
      setAttachments([]);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEditSave = id => {
    if (editText.trim()) {
      editMessage(id, editText);
      setEditingId(null);
      setEditText("");
    }
  };

  const handleSummarize = async () => {
    // Provide richer context: user and text for each message
    const transcript = messages.map(m => `${m.user || "Anonymous"}: ${m.text}`).join("\n");
    const sum = await summarizeChat(transcript);
    setSummary(sum);
  };

  const handleSmartReplies = async () => {
    const context = messages.slice(-5); // last 5 messages for context
    const replies = await getSmartReplies(input, context);
    setSmartReplies(replies);
  };

  // When a smart reply is used, set input and clear smartReplies
  const handleUseSmartReply = (reply) => {
    setInput(reply);
    setSmartReplies([]);
  };

  // Helper to render attachments
  const renderAttachments = (atts = []) =>
    atts.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-1">
        {atts.map((att, i) =>
          att.type === "image" ? (
            <img
              key={i}
              src={att.url}
              alt={att.name}
              className="w-24 h-24 object-cover rounded border"
            />
          ) : (
            <a
              key={i}
              
              href={`http://localhost:4001/download/${att.name}`}
              download={att.name}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-700 underline break-all"
            >
              📎 {att.name} <span className="ml-1">⬇️</span>
            </a>
          )
        )}
      </div>
    );

  // Helper to get parent message snippet
  const getParentSnippet = (id) => {
    const parent = messages.find((m) => m._id === id);
    if (!parent) return null;
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2 border-l-4 border-blue-400 text-xs">
        <span className="font-semibold">{parent.user || "Anonymous"}:</span>{" "}
        {parent.text.length > 60 ? parent.text.slice(0, 60) + "..." : parent.text}
        {renderAttachments(parent.attachments)}
      </div>
    );
  };

  return (
    <div
      className="max-w-lg mx-auto mt-10 p-6 shadow-lg rounded-lg flex flex-col h-[600px]"
      style={{
        backgroundColor: getCardColor(theme),
        color: getTextColor(theme),
        boxShadow: theme === "dark"
          ? "0 2px 24px 0 #080c18"
          : "0 2px 12px 0 #e5e7eb"
      }}
    >
      <h2 className="text-2xl font-bold mb-4 sticky top-0 z-10"
        style={{ backgroundColor: getCardColor(theme), color: getTextColor(theme) }}>
        Team Chat
      </h2>
      {/* Chat summary section */}
      {/* <div className="mb-2 flex items-center gap-2">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={handleSummarize}
        >
          Summarize Chat
        </button>
        {summary && ( */}
          {/* <span className="ml-2 text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
            <b>Summary:</b> {summary}
          </span>
        )}
      </div> */}
      <div className="flex-1 border rounded-lg p-3 overflow-y-auto mb-4"
        style={{
          backgroundColor: theme === "dark"
            ? "#181B24"
            : theme === "reading"
            ? "#f7ecd9"
            : "#f9fafb",
          borderColor: theme === "dark" ? "#23263a" : "#e5e7eb",
        }}>
        {messages.length === 0 && (
          <div className="italic text-center mt-10"
            style={{ color: theme === "dark" ? "#7d8597" : "#a0aec0" }}>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`mb-2 p-2 rounded-lg max-w-[85%] flex flex-col relative group ${
              idx % 2 === 0 ? "self-start" : "self-end"
            }`}
            style={{
              backgroundColor:
                idx % 2 === 0
                  ? theme === "dark"
                    ? "#2c3350"
                    : theme === "reading"
                    ? "#f6e9c9"
                    : "#bfdbfe"
                  : theme === "dark"
                  ? "#353950"
                  : theme === "reading"
                  ? "#f2e3c9"
                  : "#e5e7eb",
              color:
                idx % 2 === 0
                  ? theme === "dark"
                    ? "#93c5fd"
                    : theme === "reading"
                    ? "#3b2f14"
                    : "#1e3a8a"
                  : theme === "dark"
                  ? "#e0e7ef"
                  : theme === "reading"
                  ? "#3b2f14"
                  : "#374151",
            }}
          >
            {/* Show parent message snippet if this is a reply */}
            {msg.replyTo && getParentSnippet(msg.replyTo)}
            <div className="flex items-center justify-between">
              <span className="font-semibold">{msg.user || "Anonymous"}:</span>
              {msg.pinned && (
                <span className="ml-2 text-yellow-500" title="Pinned">📌</span>
              )}
            </div>
            {editingId === msg._id ? (
              <div className="flex mt-1">
                <input
                  className="flex-1 border rounded p-1 mr-2"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded mr-1"
                  onClick={() => handleEditSave(msg._id)}
                >
                  Save
                </button>
                <button
                  className="bg-gray-400 text-white px-2 py-1 rounded"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span>{msg.text}</span>
            )}
            {/* Render attachments */}
            {renderAttachments(msg.attachments)}
            <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => handleEdit(msg._id, msg.text)}
              >
                Edit
              </button>
              <button
                className="text-xs text-red-600 hover:underline"
                onClick={() => deleteMessage(msg._id)}
              >
                Delete
              </button>
              <button
                className="text-xs text-yellow-600 hover:underline"
                onClick={() => pinMessage(msg._id, !msg.pinned)}
              >
                {msg.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="text-xs text-green-600 hover:underline"
                onClick={() => reactMessage(msg._id, username, "👍")}
              >
                👍
              </button>
              <button
                className="text-xs text-pink-600 hover:underline"
                onClick={() => reactMessage(msg._id, username, "❤️")}
              >
                ❤️
              </button>
              <button
                className="text-xs text-indigo-600 hover:underline"
                onClick={() => handleReply(msg)}
              >
                Reply
              </button>
            </div>
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="mt-1 flex gap-1">
                {msg.reactions.map((r, i) => (
                  <span key={i} className="text-xs">
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}
            {msg.edited && (
              <span className="text-xs text-gray-400 mt-1">(edited)</span>
            )}
          </div>
        ))}
      </div>
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded relative">
          <span className="text-xs text-gray-700">
            Replying to <b>{replyTo.user || "Anonymous"}</b>:{" "}
            {replyTo.text.length > 60 ? replyTo.text.slice(0, 60) + "..." : replyTo.text}
          </span>
          <button
            className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-lg"
            onClick={handleCancelReply}
            title="Cancel reply"
          >
            ×
          </button>
          {renderAttachments(replyTo.attachments)}
        </div>
      )}
      {/* Input, file upload, and smart reply button */}
      <div className="flex items-center gap-2">
        <input
          id="chat-input"
          className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 transition"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message"
          onKeyDown={e => e.key === "Enter" && handleSend()}
          style={{
            backgroundColor: getInputColor(theme),
            color: getTextColor(theme),
            borderColor: theme === "dark" ? "#353950" : "#d1d5db",
          }}
        />
        <label className="bg-gray-200 hover:bg-gray-300 cursor-pointer px-3 py-2 rounded-none border-t border-b border-r border-gray-300">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <span role="img" aria-label="Attach">📎</span>
        </label>
        <button
          className="rounded font-semibold px-3 py-2 transition bg-purple-500 text-white hover:bg-purple-600"
          style={{ minWidth: 0 }}
          onClick={handleSmartReplies}
          disabled={input.trim().length === 0}
          title="Suggest smart replies"
        >
          💡
        </button>
        <button
          className="rounded-r-lg font-semibold px-5 py-2 transition ml-1"
          style={{
            backgroundColor: theme === "dark"
              ? "#2563eb"
              : theme === "reading"
              ? "#e8d7ba"
              : "#2563eb",
            color: theme === "reading" ? "#3b2f14" : "#fff",
            opacity: (!input.trim() && attachments.length === 0) ? 0.6 : 1,
            cursor: (!input.trim() && attachments.length === 0) ? "not-allowed" : "pointer"
          }}
          onClick={handleSend}
          disabled={!input.trim() && attachments.length === 0}
        >
          {uploading ? "Uploading..." : "Send"}
        </button>
      </div>
      {/* Show selected attachments before sending */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachments.map((att, i) =>
            att.type === "image" ? (
              <img
                key={i}
                src={att.url}
                alt={att.name}
                className="w-16 h-16 object-cover rounded border"
              />
            ) : (
              <span key={i} className="text-xs text-blue-700">
                📎 {att.name}
              </span>
            )
          )}
        </div>
      )}
      {/* Smart replies section */}
      {smartReplies.length > 0 && (
        <div className="mt-4">
          <span className="text-sm text-gray-500">Smart Replies:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {smartReplies.map((r, i) => (
              <button
                key={i}
                className="bg-gray-200 rounded px-2 py-1 m-1 hover:bg-blue-100"
                onClick={() => handleUseSmartReply(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}