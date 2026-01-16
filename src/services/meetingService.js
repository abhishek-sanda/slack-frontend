import axios from "axios";
const API = import.meta.env.VITE_GATEWAY_API_URL || "http://localhost:4002/api";

export async function fetchMeetings() {
  const res = await axios.get(`${API}/meetings`);
  return res.data;
}

// Create meeting: expects { title, time, participants (array), summary? }
export async function createMeeting({ title, time, participants, summary }) {
  // Defensive: Ensure participants is always an array
  if (!Array.isArray(participants)) {
    throw new Error("participants must be an array");
  }
  const res = await axios.post(`${API}/meetings`, {
    title,
    time,
    participants,
    summary,
  });
  return res.data;
}

export async function updateMeeting(id, updates) {
  const res = await axios.put(`${API}/meetings/${id}`, updates);
  return res.data;
}

export async function deleteMeeting(id) {
  const res = await axios.delete(`${API}/meetings/${id}`);
  return res.data;
}
// export async function createMeeting(meeting) {
//   const res = await fetch("/api/meetings", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(meeting),
//   });
//   if (!res.ok) throw new Error("Failed to create meeting");
//   return await res.json();
// }
// // (keep your uploadRecording here for media service)
// const MEDIA_API = import.meta.env.VITE_GATEWAY_API_URL || "http://localhost:4003/api";

// export async function uploadRecording(file) {
//   const formData = new FormData();
//   formData.append("file", file);
//   await axios.post(`${MEDIA_API}/media/upload`, formData);
// }