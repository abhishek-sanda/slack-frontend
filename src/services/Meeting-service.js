
import axios from "axios";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_MEETING_API_URL || "http://localhost:4007/api" || "/api";

// 

let socket;

export const connectSocket = (meetingId, token) => {
  socket = io(`${API}/meetings`, {
    path: "/socket.io",
    query: { meetingId, token },
    transports: ["websocket"]
  });
  return socket;
};

export const getSocket = () => socket;


export const createMeeting = async (meetingData) => {
  const res = await axios.post(`${API}/meetings/create`, {
    host: meetingData.host,
    title: meetingData.title,
    settings: {
      requiresApproval: meetingData.requiresApproval,
      recordingAllowed: true,
      maxParticipants: 50
    }
  });
  return res.data;
};

export const joinMeeting = async (meetingId, name, email ="") => {
  const res = await axios.post(`${API}/meetings/${meetingId}/join`, {
     name,
     email
    });
  return res.data;
};

// Host starts the meeting
export const startMeeting = async (meetingId, token) => {
  const res = await axios.post(`${API}/meetings/${meetingId}/start`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const admitGuest = async (meetingId, name, token) => {
  const res = await axios.post(`${API}/meetings/${meetingId}/admit`, 
    {  name },
    { headers: { Authorization: `Bearer ${token}` } 
   });
  return res.data;
};

export const getMeeting = async (meetingId) => {
  try {
    const res = await axios.get(`${API}/meetings/${meetingId}`);
    return res.data;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    throw err;
  }
};

export const sendChat = async (meetingId, user, message) => {
  const res = await axios.post(`${API}/meetings/${meetingId}/chat`, { user, message });
  return res.data;
};

export const addNote = async (meetingId, author, text) => {
  const res = await axios.post(`${API}/meetings/${meetingId}/note`, { author, text });
  return res.data;
};

// export const addRecording = async (meetingId, url, by) => {
//   const res = await axios.post(`${API}/meetings/${meetingId}/recording`, { url, by });
//   return res.data;
// };

// Update the addRecording function to handle FormData
export const addRecording = async (meetingId, formData, config) => {
  const res = await axios.post(`${API}/meetings/${meetingId}/recording`, formData, config);
  return res.data;
};