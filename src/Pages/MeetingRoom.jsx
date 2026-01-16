import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { 
    getMeeting,
    sendChat,
    addNote,
    addRecording,
    connectSocket,
    getSocket } from "../services/Meeting-service";
import { jwtDecode } from "../utils/jwtDecode";
import Peer from "peerjs";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareLink, setShareLink] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [isHost, setIsHost] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoBlobRef = useRef(null);
  const chatContainerRef = useRef(null);
  const myVideoRef = useRef(null);
  const currentUser = "You"; // In a real app, this would come from auth
  const socketRef = useRef(null);
  const [peerId, setPeerId] = useState("");
  const [remoteStreams, setRemoteStreams] = useState([]);

  

   // State for attendee start meeting request status
  const [startMeetingStatus, setStartMeetingStatus] = useState("");

  // Listen for start meeting request status events
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("startMeetingWaiting", () => {
      setStartMeetingStatus("Waiting for host to accept your request...");
    });
    socketRef.current.on("startMeetingAccepted", () => {
      setStartMeetingStatus("Host accepted your request. Meeting is starting!");
      setTimeout(() => setStartMeetingStatus("") , 4000);
    });
    socketRef.current.on("startMeetingRejected", () => {
      setStartMeetingStatus("Host rejected your request to start the meeting.");
      setTimeout(() => setStartMeetingStatus("") , 4000);
    });
    return () => {
      socketRef.current.off("startMeetingWaiting");
      socketRef.current.off("startMeetingAccepted");
      socketRef.current.off("startMeetingRejected");
    };
  }, [meetingId]);
  
  useEffect(() => {
    const token = localStorage.getItem("meetingToken");
    socketRef.current = connectSocket(meetingId, token);

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socketRef.current.on("attendeeJoined", (data) => {
      if (data.requiresApproval) {
        // Only relevant for host view
      } else {
        setAttendees(prev => [...prev, data.attendee]);
      }
    });

    socketRef.current.on("attendeeLeft", ({ attendeeId }) => {
      setAttendees(prev => prev.filter(a => a._id !== attendeeId));
    });

    socketRef.current.on("newChatMessage", (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketRef.current.on("newNoteAdded", (note) => {
      setNotes(prev => [...prev, note]);
    });

    socketRef.current.on("attendeeRaisedHand", ({ attendeeId }) => {
      setAttendees(prev => prev.map(a => 
        a._id === attendeeId ? { ...a, raisedHand: true } : a
      ));
    });

    socketRef.current.on("error", (error) => {
      setError(error.message);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [meetingId]);


  useEffect(() => {
     const fetchMeetingData = async () => {
      setLoading(true);
      try {
        const data = await getMeeting(meetingId);
        if (data) {
          setChatMessages(data.chat || []);
          setNotes(data.notes || []);
          setAttendees(data.attendees || []);
          const token = localStorage.getItem("meetingToken");
          if (token) {
            try {
              const decoded = jwtDecode(token);
              setIsHost(decoded.isHost || false);
            } catch (e) {
              console.error("Token decoding error:", e);
            }
          }
        } 
        // else {
        //   setError("Meeting not found");
        // }
      } catch (err) {
        setError(err.response?.data?.message || 
                err.message || 
                "Failed to load meeting details");
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetingData();
  }, [meetingId]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const message = {
        // user: currentUser,
        user: localStorage.getItem("userName") || "Anonymous",
        text: newMessage,
        timestamp: new Date().toISOString()
      };
      
      // Optimistic update
      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
      
      await sendChat(meetingId, message.user, message.text);

    } catch (err) {
      setError("Failed to send message");
      // Revert optimistic update
      setChatMessages(prev => prev.slice(0, -1));
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const note = {
        author: currentUser,
        text: newNote,
        createdAt: new Date().toISOString()
      };
      
      // Optimistic update
      setNotes(prev => [...prev, note]);
      setNewNote("");
      
      await addNote(meetingId, currentUser, newNote);
    } catch (err) {
      setError("Failed to add note");
      setNotes(prev => prev.slice(0, -1));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: "screen" },
        audio: true 
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        videoBlobRef.current = blob;
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to start recording: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadRecording = async () => {
    if (!videoBlobRef.current) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", videoBlobRef.current, `meeting-${meetingId}-${Date.now()}.webm`);
      
      const response = await addRecording(meetingId, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setShareLink(response.shareableLink);
      setUploading(false);
    } catch (err) {
      setError("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      // You might want to use a toast notification instead of alert
      setError("Link copied to clipboard!");
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



  // Find current attendee's hand status using unique identifier if possible
  const userName = localStorage.getItem("userName") || "Anonymous";
  const userEmail = localStorage.getItem("userEmail") || null;
  let currentAttendee = null;
  if (userEmail) {
    currentAttendee = attendees.find(a => a.email === userEmail);
  }
  if (!currentAttendee) {
    currentAttendee = attendees.find(a => a.name === userName);
  }
  const handRaised = currentAttendee?.raisedHand;

  const handleHandToggle = () => {
    if (!socketRef.current) return;
    if (handRaised) {
      socketRef.current.emit("lowerHand");
    } else {
      socketRef.current.emit("raiseHand");
    }
  };

  useEffect(() => {
    const peer = new Peer();
    peer.on("open", (id) => {
      setPeerId(id);
      // Notify server of your peerId (send via socket)
      socketRef.current.emit("peerId", id);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => [...prev, remoteStream]);
        });
      });

      // Listen for other users' peerIds from server and call them
      socketRef.current.on("userPeerId", (otherPeerId) => {
        const call = peer.call(otherPeerId, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => [...prev, remoteStream]);
        });
      });
    });
  }, [meetingId]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {startMeetingStatus && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-center animate-pulse">{startMeetingStatus}</div>
      )}
      {loading && (
        <div className="text-center py-8">
          <p>Loading meeting details...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
        
      {!loading && !error && (
        <>
          <div className="flex gap-4 flex-col lg:flex-row">
            {/* Left Column - Chat and Notes */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 ${activeTab === "chat" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                  onClick={() => setActiveTab("chat")}
                >
                  Live Chat
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === "notes" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                  onClick={() => setActiveTab("notes")}
                >
                  Meeting Notes
                </button>
              </div>

              {/* Chat Tab */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-[400px] border rounded-lg">
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.user === currentUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.user === currentUser ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                          <div className="font-medium text-sm">{msg.user}</div>
                          <div>{msg.text}</div>
                          <div className="text-xs opacity-70 text-right mt-1">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="flex flex-col h-[400px] border rounded-lg">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {notes.map((note, index) => (
                      <div key={index} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{note.author}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap">{note.text}</div>
                      </div>
                    ))}
                    {notes.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        No notes yet. Add your first note!
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      rows={3}
                      className="w-full border rounded px-3 py-2"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Attendees and Recording */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">Attendees ({attendees.length})</h3>
                <ul className="space-y-2">
                  {attendees.map((a, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="flex items-center">
                        {a.name}
                        {a.raisedHand && (
                          <span className="ml-2" role="img" aria-label="raised hand">✋</span>
                        )}
                      </span>
                      {a.role === "host" && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Host
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">Recording</h3>
                <button
                  className={`w-full px-4 py-2 rounded ${recording ? "bg-red-600" : "bg-blue-600"} text-white`}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={uploading}
                >
                  {recording ? "Stop Recording" : "Start Screen Recording"}
                </button>
                
                {recording && (
                  <div className="mt-2 text-red-600 font-medium flex items-center">
                    <span className="animate-pulse">●</span>
                    <span className="ml-2">Recording in progress</span>
                  </div>
                )}
                
                {videoUrl && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recording Preview</h4>
                    <video src={videoUrl} controls className="w-full rounded" />
                    
                    <div className="mt-3 space-y-2">
                      {!shareLink ? (
                        <button
                          onClick={uploadRecording}
                          disabled={uploading}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                        >
                          {uploading ? `Uploading... ${uploadProgress}%` : "Upload Recording"}
                        </button>
                      ) : (
                        <>
                          <div className="p-2 bg-gray-100 rounded text-sm break-all">
                            <div className="font-medium text-gray-700 mb-1">Shareable link:</div>
                            <a 
                              href={shareLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {shareLink}
                            </a>
                          </div>
                          <button
                            onClick={copyShareLink}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded"
                          >
                            Copy Link
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Add raise/lower hand button for attendees */}
      {!isHost && (
        <button
          onClick={handleHandToggle}
          className={`fixed bottom-4 right-4 ${handRaised ? "bg-gray-500" : "bg-yellow-500"} text-white p-3 rounded-full shadow-lg`}
        >
          {handRaised ? "🙌 Lower Hand" : "✋ Raise Hand"}
        </button>
      )}
    </div>
  );
}