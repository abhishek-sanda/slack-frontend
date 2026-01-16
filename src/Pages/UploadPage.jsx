// import React, { useState } from "react";
// import { uploadRecording } from "../services/mediaService";

// export default function UploadPage() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");

//   const handleUpload = async () => {
//     if (!file) return;
//     setStatus("Uploading...");
//     try {
//       await uploadRecording(file);
//       setStatus("Uploaded successfully! AI will process and summarize soon.");
//     } catch {
//       setStatus("Upload failed.");
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-2">Upload Meeting Recording</h2>
//       <input
//         type="file"
//         accept="audio/*,video/*"
//         onChange={e => setFile(e.target.files[0])}
//       />
//       <button
//         className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
//         onClick={handleUpload}
//         disabled={!file}
//       >
//         Upload
//       </button>
//       <div className="mt-2">{status}</div>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { uploadRecording } from "../services/mediaService";

// export default function UploadPage() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");

//   const handleUpload = async () => {
//     if (!file) return;
//     setStatus("Uploading...");
//     try {
//       await uploadRecording(file);
//       setStatus("Uploaded successfully! AI will process and summarize soon.");
//     } catch {
//       setStatus("Upload failed.");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Meeting Recording</h2>
//       <label className="block mb-4">
//         <span className="block text-gray-700 mb-1">Select audio or video file</span>
//         <input
//           type="file"
//           accept="audio/*,video/*"
//           onChange={e => setFile(e.target.files[0])}
//           className="block w-full text-sm text-gray-600
//                      file:mr-4 file:py-2 file:px-4
//                      file:rounded file:border-0
//                      file:text-sm file:font-semibold
//                      file:bg-blue-50 file:text-blue-700
//                      hover:file:bg-blue-100
//                      transition"
//         />
//       </label>
//       <button
//         className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold px-4 py-2 rounded transition disabled:bg-blue-300"
//         onClick={handleUpload}
//         disabled={!file}
//       >
//         Upload
//       </button>
//       <div className={`mt-4 min-h-[24px] ${
//         status === "Uploaded successfully! AI will process and summarize soon."
//           ? "text-green-600"
//           : status === "Uploading..."
//           ? "text-blue-600"
//           : status === "Upload failed."
//           ? "text-red-600"
//           : "text-gray-700"
//       }`}>
//         {status}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { uploadRecording, getSummary, summarizeTranscriptText } from "../services/mediaService";
import { useTheme } from "./ThemeContext";
import axios from "axios";
const API = import.meta.env.VITE_GATEWAY_API_URL || "http://localhost:4003/api";

// Theme helpers
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

export default function UploadPage() {
  const { theme } = useTheme();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [recordingId, setRecordingId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [textSummary, setTextSummary] = useState("");
  const [textSummaryStatus, setTextSummaryStatus] = useState("");
  const [textSummaryError, setTextSummaryError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Uploading...");
    setProgress(0);
    setSummary("");
    setSummaryError("");
    setRecordingId(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Upload file with progress
      await axios.post(`${API}/media/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setStatus("Uploaded successfully! Summarizing text...");
      let summaryText = "";
      let result = null;
      try {
        // Try to get transcript text and recordingId from backend
        result = await uploadRecording(file);
        if (result?.recordingId) {
          setRecordingId(result.recordingId);
        }
        // If transcript text is available, summarize immediately
        if (result?.transcriptText) {
          setStatus("Summarizing transcript text...");
          const res = await summarizeTranscriptText(result.transcriptText);
          summaryText = res.summary;
          setSummary(summaryText);
          setStatus("Summary ready!");
          setPolling(false);
        } else if (result?.recordingId) {
          // If no transcript, start polling for summary
          setPolling(true);
          setStatus("Uploaded successfully! AI is processing and will summarize soon.");
        } else {
          setStatus("Upload succeeded, but no summary available.");
        }
      } catch (err) {
        setStatus("Uploaded successfully! AI is processing and will summarize soon.");
        setPolling(!!(result && result.recordingId));
      }
    } catch (err) {
      setStatus("Upload failed.");
      setSummary("");
      setSummaryError(err?.message || "");
    }
  };

  // Polling effect for summary
  useEffect(() => {
    if (!recordingId || !polling) return;
    setStatus("Processing... Waiting for AI summary...");
    setSummaryError("");
    const interval = setInterval(async () => {
      try {
        const res = await getSummary(recordingId);
        if (res && res.status === "ready" && res.summary) {
          setSummary(res.summary);
          setStatus("Summary ready!");
          setPolling(false);
          clearInterval(interval);
        } else if (res && res.status === "failed") {
          setSummary("");
          setStatus("AI summary failed.");
          setSummaryError(res.error || "AI could not generate a summary for this file.");
          setPolling(false);
          clearInterval(interval);
        }
        // else: still processing
      } catch (err) {
        setSummary("");
        setStatus("AI summary failed.");
        setSummaryError("Could not fetch summary. Please try again later.");
        setPolling(false);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [recordingId, polling]);

  const handleTextSummarize = async () => {
    setTextSummary("");
    setTextSummaryStatus("Summarizing...");
    setTextSummaryError("");
    try {
      const res = await summarizeTranscriptText(transcriptText);
      setTextSummary(res.summary);
      setTextSummaryStatus("Summary ready!");
    } catch (err) {
      setTextSummaryError(err.message || "Failed to summarize transcript.");
      setTextSummaryStatus("");
    }
  };

  return (
    <div
      className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-lg transition-colors duration-300"
      style={{
        backgroundColor: getCardColor(theme),
        color: getTextColor(theme),
      }}
    >
      <h2
        className="text-2xl font-bold mb-4"
        style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
      >
        Upload Meeting Recording
      </h2>
      <label className="block mb-4">
        <span className="block mb-1" style={{ color: getTextColor(theme) }}>
          Select audio or video file
        </span>
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={e => setFile(e.target.files[0])}
          className="block w-full text-sm
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     transition"
          style={{
            backgroundColor: getInputBg(theme),
            color: getTextColor(theme),
            borderColor: getInputBorder(theme),
          }}
        />
      </label>
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold px-4 py-2 rounded transition disabled:bg-blue-300"
        onClick={handleUpload}
        disabled={!file}
      >
        <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
        </svg>
        Upload
      </button>
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      <div
        className={`mt-4 min-h-[24px]`}
        style={{
          color:
            status === "Summary ready!"
              ? "#16a34a"
              : status.startsWith("Uploading") || status.startsWith("Processing")
              ? "#2563eb"
              : status === "Upload failed." || status === "AI summary failed."
              ? "#dc2626"
              : getTextColor(theme),
        }}
      >
        {status}
      </div>
      {summaryError && (
        <div className="mt-2 text-red-600 text-sm">{summaryError}</div>
      )}
      {summary && (
        <div
          className="mt-6 p-4 rounded border"
          style={{
            backgroundColor:
              theme === "dark"
                ? "#1e2233"
                : theme === "reading"
                ? "#f7ecd9"
                : "#f9fafb",
            borderColor: getInputBorder(theme),
            color: getTextColor(theme),
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}>
            AI-Generated Summary:
          </h3>
          <p className="whitespace-pre-line">{summary}</p>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(summary)}`}
            download={file ? `${file.name}-summary.txt` : 'summary.txt'}
            className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
          >
            Download Summary Text
          </a>
        </div>
      )}
      <div className="mt-8 p-4 rounded border" style={{ background: "#f9fafb" }}>
        <h3 className="font-semibold mb-2">Paste Transcript Text</h3>
        <textarea
          className="w-full p-2 border rounded mb-2"
          rows={6}
          value={transcriptText}
          onChange={e => setTranscriptText(e.target.value)}
          placeholder="Paste your meeting transcript here..."
        />
        <button
          className="py-2 px-4 rounded font-semibold bg-blue-600 text-white"
          onClick={handleTextSummarize}
          disabled={!transcriptText}
        >
          Summarize Transcript
        </button>
        {textSummaryStatus && (
          <div className="mt-2 text-blue-600 text-sm">{textSummaryStatus}</div>
        )}
        {textSummaryError && (
          <div className="mt-2 text-red-600 text-sm">{textSummaryError}</div>
        )}
        {textSummary && (
          <div className="mt-4 p-3 rounded border bg-white">
            <h4 className="font-semibold mb-1">AI-Generated Summary:</h4>
            <p className="whitespace-pre-line">{textSummary}</p>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(textSummary)}`}
              download="transcript-summary.txt"
              className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
            >
              Download Summary Text
            </a>
          </div>
        )}
      </div>
      {file && (
        <div className="mt-2">
          <span className="text-gray-700">Selected: {file.name}</span>
        </div>
      )}
      {recordingId && (
        <a
          href={`/api/media/download/${recordingId}`}
          className="text-blue-600 underline mt-2 block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Uploaded File
        </a>
      )}
    </div>
  );
}