import axios from "axios";
const API = import.meta.env.VITE_GATEWAY_API_URL || "http://localhost:4003/api";

export async function uploadRecording(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${API}/media/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // Correct: axios returns response in .data
}

export async function getSummary(recordingId) {
  const res = await axios.get(`${API}/media/summary/${recordingId}`);
  return res.data; // Correct: axios returns response in .data
}

export async function summarizeTranscriptText(transcript) {
  try {
    const res = await axios.post(`${API}/media/summarize-text`, { transcript });
    return res.data;
  } catch (err) {
    // Show backend error message if available
    throw new Error(
      err.response?.data?.error || err.message || "Summarize text API error"
    );
  }
}
