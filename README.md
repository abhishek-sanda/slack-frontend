

# Teams Video Meeting App (Short Guide)

**Features:**
- Uploading video/audio recordings, AI-powered summarization of meeting content
- WhatsApp-like chat: file sharing, smart replies (AI), pin/edit messages, search, and more
- Video conferencing (PeerJS/WebRTC) with real-time host/attendee roles
- Live chat, collaborative notes, hand raise/lower, attendee feedback
- Host/attendee roles, waiting room, approval/rejection flows
- Meeting recording, file sharing, and download
- Real-time notifications and seamless UI/UX


**Quick Start:**
1. `cd frontend && npm install && npm start` 
2. `cd backend && npm install && npm start` 

**Main Folders:**
- `frontend/src/Pages/` — React pages (MeetingRoom, CreateMeeting, JoinMeeting, etc.)
- `frontend/src/services/` — API/socket logic
- `backend/services/Meeting-services/` — Backend logic (controllers, models, routes)

**.env Example (backend):**
```
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
```

**Tech:** React, Node.js, Express, Socket.IO, PeerJS, MongoDB
