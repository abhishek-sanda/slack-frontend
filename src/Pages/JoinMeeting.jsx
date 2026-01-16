// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { joinMeeting } from "../services/Meeting-service";

// export default function JoinMeeting() {
//   const { meetingId } = useParams();
//   const [name, setName] = useState("");
//   const [status, setStatus] = useState("");
//   const navigate = useNavigate();

//   const handleJoin = async () => {
//     if (!meetingId) {
//       setStatus("No Meeting ID provided in URL.");
//       return;
//     }
//     try {
//       const res = await joinMeeting(meetingId, name);
//       if (res.status === "waiting") setStatus("Waiting for host to admit you...");
//       else if (res.status === "admitted") navigate(`/meetingroom/${meetingId}`);
//       else setStatus("Unknown response from server.");
//     } catch (err) {
//       setStatus("Failed to join meeting.");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-2">Join Meeting</h2>
//       <input
//         className="border p-2 w-full mb-2"
//         placeholder="Your Name"
//         value={name}
//         onChange={e => setName(e.target.value)}
//       />
//       <button
//         className="bg-green-600 text-white px-4 py-2 rounded"
//         onClick={handleJoin}
//         disabled={!name}
//       >
//         Join
//       </button>
//       {status && <div className="mt-4">{status}</div>}
//     </div>
//   );
// }

import React, { useState, useEffect,useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { joinMeeting, getMeeting,connectSocket, getSocket } from "../services/Meeting-service";
// import jwtDecode from "../components/jwtDecode";

export default function JoinMeeting() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [status, setStatus] = useState({
    message: "",
    type: "" // 'info', 'success', 'error'
  });
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForAdmission, setIsWaitingForAdmission] = useState(false);
  const [admissionCheckInterval, setAdmissionCheckInterval] = useState(null);
 
  const [waitingForHost, setWaitingForHost] = useState(false);
  const socketRef = useRef(null);


  // Check if meeting exists when component mounts
  useEffect(() => {
    const verifyMeeting = async () => {
      try {
        const meeting = await getMeeting(meetingId);
        setMeetingInfo({
          host: meeting.host,
          title: meeting.title || `Meeting ${meetingId}`,
          requiresApproval: meeting.requiresApproval !== false
        });
      } catch (err) {
        setStatus({
          message: "Meeting not found or invalid meeting ID",
          type: "error"
        });
      }
    };

    if (meetingId) verifyMeeting();

    return () => {
      if (admissionCheckInterval) clearInterval(admissionCheckInterval);
    };
  }, [meetingId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("admissionApproved", () => {
      setStatus({ message: "Admitted! Redirecting...", type: "success" });
      setTimeout(() => navigate(`/meeting/${meetingId}`), 1000);
    });

    return () => {
      if (socket) socket.off("admissionApproved");
    };
  }, [meetingId, navigate]);


  // Check for auto-admission from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("autoJoin") === "true") {
      handleJoin({ skipApproval: true });
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkAdmissionStatus = async (name) => {
    try {
      if (!meetingId) {
        setStatus({ message: "Invalid meeting ID.", type: "error" });
        if (admissionCheckInterval) clearInterval(admissionCheckInterval);
        setIsWaitingForAdmission(false);
        return;
      }
      const meeting = await getMeeting(meetingId);
      if (!meeting) {
        setStatus({ message: "Meeting not found.", type: "error" });
        if (admissionCheckInterval) clearInterval(admissionCheckInterval);
        setIsWaitingForAdmission(false);
        return;
      }
      const attendee = meeting.attendees.find(a => a.name === name);
      if (attendee?.admitted) {
        if (admissionCheckInterval) clearInterval(admissionCheckInterval);
        navigate(`/meeting/${meetingId}`);
      }
    } catch (err) {
      setStatus({ message: "Error checking admission status.", type: "error" });
      if (admissionCheckInterval) clearInterval(admissionCheckInterval);
      setIsWaitingForAdmission(false);
      console.error("Error checking admission status:", err);
    }
  };

  const handleJoin = async ({ skipApproval = false } = {}) => {
    if (!meetingId) {
      setStatus({
        message: "No Meeting ID provided",
        type: "error"
      });
      return;
    }

    if (!formData.name.trim()) {
      setStatus({
        message: "Please enter your name",
        type: "error"
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: "", type: "" });

    try {
      const res = await joinMeeting(meetingId, formData.name, formData.email);
      localStorage.setItem("meetingToken", res.token);
      localStorage.setItem("userName", formData.name);
      
      if (res.status === "admitted" || skipApproval) {
        navigate(`/meeting/${meetingId}`);
      } else if (res.status === "waiting") {
        setStatus({
          message: "Waiting for host approval...",
          type: "info"
        });
        
        
        // Connect to WebSocket for real-time updates
        socketRef.current = connectSocket(meetingId, res.token);
        
        socketRef.current.on("admissionApproved", () => {
          setStatus({ message: "Admitted! Redirecting...", type: "success" });
          setTimeout(() => navigate(`/meeting/${meetingId}`), 1000);
        });

        socketRef.current.on("admissionRejected", () => {
          setStatus({
            message: "Host has rejected your request to join",
            type: "error"
          });
          setWaitingForHost(false);
        });
      }

      if (res.requiresApproval) {
        setIsWaitingForAdmission(true);
        
        // Start checking admission status every 5 seconds
        const interval = setInterval(() => checkAdmissionStatus(formData.name), 5000);
        setAdmissionCheckInterval(interval);
      } else {
        setStatus({
          message: res.message || "Could not join meeting",
          type: "error"
        });
      }
    } catch (err) {
      setStatus({
        message: err.res?.data?.message || "Failed to join meeting",
        type: "error"
      });
      console.error("Join meeting error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {meetingInfo && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {meetingInfo.title}
            </h1>
            <p className="text-gray-600">
              Hosted by: {meetingInfo.host}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isWaitingForAdmission}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isWaitingForAdmission}
            />
          </div>

          {status.message && (
            <div className={`p-3 rounded-md ${
              status.type === "error" ? "bg-red-50 text-red-700" :
              status.type === "success" ? "bg-green-50 text-green-700" :
              "bg-blue-50 text-blue-700"
            }`}>
              {status.message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => handleJoin()}
              disabled={!formData.name.trim() || isLoading || isWaitingForAdmission}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                (!formData.name.trim() || isLoading || isWaitingForAdmission) 
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
                  Joining...
                </>
              ) : isWaitingForAdmission ? (
                "Waiting for admission..."
              ) : (
                "Join Meeting"
              )}
            </button>
          </div>

          {isWaitingForAdmission && (
            <div className="text-center">
              <button
                onClick={() => {
                  if (admissionCheckInterval) clearInterval(admissionCheckInterval);
                  setIsWaitingForAdmission(false);
                  setStatus({ message: "", type: "" });
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}