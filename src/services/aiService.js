import axios from "axios";
const API = import.meta.env.VITE_AI_API_URL || "http://localhost:4004/api/ai";

export async function summarizeChat(messages) {
  const res = await axios.post(`${API}/summarize`, { messages });
  return res.data.summary;
}

export async function getSmartReplies(lastMessage, context) {
  const res = await fetch( `${API}/suggest-replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lastMessage, context }),
  });
  return (await res.json()).replies;
}

export async function generateMeetingMinutes(transcript) {
  const res = await fetch(`${API}/meeting-minutes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });
  return (await res.json()).minutes;
}


