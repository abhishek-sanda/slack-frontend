const API = import.meta.env.VITE_AI_API_URL || "http://localhost:4004/api/ai";

export async function analyzeSentiment(transcript) {
  const res = await fetch(`${API}/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Sentiment API error: Invalid JSON response");
  }
  if (!res.ok) throw new Error(data?.error || "Sentiment API error");
  return data.sentiment;
}
