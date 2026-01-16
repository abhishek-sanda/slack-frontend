import axios from "axios";
const API = import.meta.env.VITE_USER_API_URL || "http://localhost:4005/api/user";

export async function registerUser({ username, password, email }) {
  const res = await axios.post(`${API}/register`, { username, password, email });
  return res.data;
}

export async function loginUser({ username, password }) {
  const res = await axios.post(`${API}/login`, { username, password });
  return res.data;
}

// Google Auth (redirects to backend)
export function handleGoogleAuth() {
  window.location.href = `${API}/auth/google`;
}

