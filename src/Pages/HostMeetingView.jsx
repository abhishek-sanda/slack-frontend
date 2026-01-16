// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { connectSocket,getMeeting, getSocket, admitGuest } from "../services/Meeting-service";
// import AttendeeList from "../components/AttendeeList";

// export default function HostMeetingView() {
//   const { meetingId } = useParams();
//   const [attendees, setAttendees] = useState([]);
//   const [pendingApprovals, setPendingApprovals] = useState([]);
//   const [error, setError] = useState(null);
//   const [meetingInfo, setMeetingInfo] = useState(null);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem("meetingToken");
//     socketRef.current = connectSocket(meetingId, token);

//      const fetchMeeting = async () => {
//       try {
//         const data = await getMeeting(meetingId);
//         setMeetingInfo(data);
//         setAttendees(data.attendees || []);
//         setPendingApprovals(data.waitingRoom || []);
//       } catch (err) {
//         setError("Failed to load meeting details");
//       }
//     };

//     fetchMeeting();

//     socketRef.current.on("attendeeJoined", (data) => {
//       if (data.requiresApproval) {
//         setPendingApprovals(prev => [...prev, data.attendee]);
//       } else {
//         setAttendees(prev => [...prev, data.attendee]);
//       }
//     });

//     socketRef.current.on("attendeeLeft", (attendeeId) => {
//       setAttendees(prev => prev.filter(a => a.id !== attendeeId));
//       setPendingApprovals(prev => prev.filter(a => a.id !== attendeeId));
//     });
//      socketRef.current.on("attendeeRaisedHand", ({ attendeeId }) => {
//       setAttendees(prev => prev.map(a => 
//         a._id === attendeeId ? { ...a, raisedHand: true } : a
//       ));
//     });

//     socketRef.current.on("error", (error) => {
//       setError(error.message);
//     });

//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [meetingId]);

//   const handleAdmit = async (attendee) => {
//     try {
//       const token = localStorage.getItem("meetingToken");
//       await admitGuest(meetingId, attendee.name, token);
//       setPendingApprovals(prev => prev.filter(a => a.id !== attendee.id));
//       setAttendees(prev => [...prev, attendee]);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to admit attendee");
//     }
//   };

//   const handleReject = (attendeeId) => {
//     setPendingApprovals(prev => prev.filter(a => a.id !== attendeeId));
//     if (socketRef.current) {
//       socketRef.current.emit("rejectAttendee", { attendeeId });
//     }
//   };

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Manage Meeting: {meetingInfo?.title}</h2>
      
//       {error && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold mb-4">Pending Approval ({pendingApprovals.length})</h3>
//           {pendingApprovals.length > 0 ? (
//             <ul className="space-y-3">
//               {pendingApprovals.map(attendee => (
//                 <li key={attendee.id} className="flex justify-between items-center p-3 border rounded">
//                   <div>
//                     <p className="font-medium">{attendee.name}</p>
//                     <p className="text-sm text-gray-500">{attendee.email}</p>
//                   </div>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => handleAdmit(attendee)}
//                       className="px-3 py-1 bg-green-600 text-white rounded text-sm"
//                     >
//                       Admit
//                     </button>
//                     <button
//                       onClick={() => handleReject(attendee.id)}
//                       className="px-3 py-1 bg-red-600 text-white rounded text-sm"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-500">No pending approvals</p>
//           )}
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold mb-4">Attendees ({attendees.length})</h3>
//           <AttendeeList attendees={attendees} />
//         </div>
//       </div>
//       {attendees.filter(a => a.raisedHand).map(attendee => (
//         <div key={attendee._id} className="flex items-center justify-between p-2 bg-yellow-50 mb-2">
//           <span>{attendee.name} raised their hand</span>
//           <button 
//             onClick={() => lowerHand(attendee._id)}
//             className="px-2 py-1 bg-green-500 text-white rounded"
//           >
//             Lower Hand
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }



import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { connectSocket, getMeeting, getSocket, admitGuest } from "../services/Meeting-service";
import AttendeeList from "../components/AttendeeList";


export default function HostMeetingView() {
  const { meetingId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [error, setError] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const socketRef = useRef(null);
  const [startRequest, setStartRequest] = useState(null); // { name, email, socketId }
  const [startRequestStatus, setStartRequestStatus] = useState("");
  const [showHandAlert, setShowHandAlert] = useState(false);
  const [handAttendee, setHandAttendee] = useState(null);

    // Lower hand handler for host
  const lowerHand = (attendee) => {
    setAttendees(prev => prev.map(a => (a._id === attendee._id || a.id === attendee.id) ? { ...a, raisedHand: false } : a));
    // Optionally, emit a socket event to notify the attendee
    const socket = getSocket && getSocket();
    if (socket) {
      socket.emit && socket.emit("lowerHand", { attendeeId: attendee._id || attendee.id });
    }
  };


  
  useEffect(() => {
    const token = localStorage.getItem("meetingToken");
    // Prefer existing socket if already connected for this meeting
    let existingSocket = getSocket && getSocket();
    if (existingSocket && existingSocket.connected) {
      socketRef.current = existingSocket;
    } else {
      socketRef.current = connectSocket(meetingId, token);
    }

    const fetchMeeting = async () => {
      try {
        const data = await getMeeting(meetingId);
        setMeetingInfo(data);
        setAttendees(data.attendees || []);
        setPendingApprovals(data.waitingRoom || []);
      } catch (err) {
        setError("Failed to load meeting details");
      }
    };

    fetchMeeting();

    socketRef.current.on("attendeeJoined", (data) => {
      if (data.requiresApproval) {
        setPendingApprovals(prev => [...prev, data.attendee]);
      } else {
        setAttendees(prev => [...prev, data.attendee]);
      }
    });

    socketRef.current.on("attendeeLeft", (attendeeId) => {
      setAttendees(prev => prev.filter(a => a.id !== attendeeId));
      setPendingApprovals(prev => prev.filter(a => a.id !== attendeeId));
    });
    socketRef.current.on("attendeeRaisedHand", ({ attendeeId }) => {
      setAttendees(prev => prev.map(a => {
        if (a._id === attendeeId) {
          setHandAttendee(a);
          setShowHandAlert(true);
          return { ...a, raisedHand: true };
        }
        return a;
      }));
    });

    socketRef.current.on("error", (error) => {
      setError(error.message);
    });

    // Listen for start meeting requests
    socketRef.current.on("startMeetingRequested", ({ requester }) => {
      setStartRequest(requester);
      setStartRequestStatus("");
    });

    // Optionally listen for meetingStarted event
    socketRef.current.on("meetingStarted", ({ startedBy }) => {
      setStartRequest(null);
      setStartRequestStatus(`Meeting started by ${startedBy}`);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [meetingId]);

  // Accept or reject start meeting request (move outside useEffect)
  const handleAcceptStart = () => {
    if (socketRef.current && startRequest) {
      socketRef.current.emit("acceptStartMeeting", { requesterSocketId: startRequest.socketId }, (res) => {
        if (res && res.status === "accepted") {
          setStartRequestStatus("Meeting started.");
        } else if (res && res.error) {
          setStartRequestStatus(res.error);
        }
        setStartRequest(null);
      });
    }
  };

  const handleRejectStart = () => {
    if (socketRef.current && startRequest) {
      socketRef.current.emit("rejectStartMeeting", { requesterSocketId: startRequest.socketId }, (res) => {
        if (res && res.status === "rejected") {
          setStartRequestStatus("Request rejected.");
        } else if (res && res.error) {
          setStartRequestStatus(res.error);
        }
        setStartRequest(null);
      });
    }
  };

  const handleAdmit = async (attendee) => {
    try {
      const token = localStorage.getItem("meetingToken");
      await admitGuest(meetingId, attendee.name, token);
      setPendingApprovals(prev => prev.filter(a => a.id !== attendee.id));
      setAttendees(prev => [...prev, attendee]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to admit attendee");
    }
  };

  const handleReject = (attendeeId) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== attendeeId));
    if (socketRef.current) {
      socketRef.current.emit("rejectAttendee", { attendeeId });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Modal for start meeting request */}
      {startRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Start Meeting Request</h3>
            <p className="mb-2">{startRequest.name} ({startRequest.email || "No email"}) wants to start the meeting.</p>
            <div className="flex gap-4 mt-4">
              <button onClick={handleAcceptStart} className="px-4 py-2 bg-green-600 text-white rounded">Accept</button>
              <button onClick={handleRejectStart} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        </div>
      )}
      {showHandAlert && handAttendee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Hand Raised</h3>
            <p className="mb-2">{handAttendee.name} has raised their hand.</p>
            <button onClick={() => setShowHandAlert(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Dismiss</button>
          </div>
        </div>
      )}
      {startRequestStatus && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-center">{startRequestStatus}</div>
      )}
      <h2 className="text-2xl font-bold mb-6">Manage Meeting: {meetingInfo?.title}</h2>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Pending Approval ({pendingApprovals.length})</h3>
          {pendingApprovals.length > 0 ? (
            <ul className="space-y-3">
              {pendingApprovals.map(attendee => (
                <li key={attendee.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{attendee.name}</p>
                    <p className="text-sm text-gray-500">{attendee.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAdmit(attendee)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Admit
                    </button>
                    <button
                      onClick={() => handleReject(attendee.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending approvals</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Attendees ({attendees.length})</h3>
          <AttendeeList attendees={attendees} onLowerHand={lowerHand} />
        </div>
      </div>
      {/* Lower hand UI is now handled in AttendeeList */}
    </div>
  );
}