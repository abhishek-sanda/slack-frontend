import './App.css';

 import React,{useState,useEffect} from "react";
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import ChatPage from "./Pages/ChatPage";
import MeetingPage from "./Pages/MeetingPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import UploadPage from "./Pages/UploadPage";
// import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./Pages/HomePage"
import AboutPage from "./Pages/AboutPage"
// import ProfileCreate from "./Pages/ProfileCreate.jsx"
// import ProfileUpdate from "./Pages/ProfileUpdate.jsx"
import { ThemeProvider } from "./Pages/ThemeContext";
import JoinMeeting from "./Pages/JoinMeeting"
import MeetingRoom from "./Pages/MeetingRoom"
import ThemePage from "./Pages/ThemePage"
import CreateMeeting from "./Pages/CreateMeeting"
import HostMeetingView from './Pages/HostMeetingView';
import PrivateLayout from "./components/PrivateLayout.jsx"


function App() {


  // Use localStorage to persist authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);


  return (
    <ThemeProvider>
      <Router>
        {/* Show Navbar on all pages except HomePage (/) */}
       
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<RegisterPage onRegister={() => setIsAuthenticated(true)} />} />

               {/* Protected Routes - With Navbar */}
        {isAuthenticated && (
          <Route element={<PrivateLayout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/theme" element={<ThemePage />} />
            <Route path="/meetingroom/:meetingId" element={<MeetingRoom />} />
            <Route path="/joinmeeting/:meetingId" element={<JoinMeeting />} />
          
            <Route path="/meetings" element={<MeetingPage />} />
            <Route path="/createmeeting" element={<CreateMeeting />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/hostmeeting/:meetingId" element={<HostMeetingView />} />
         
            </Route>
        )}

        {/* Redirect to login if not authenticated */}
        {!isAuthenticated && (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

          </Routes>
        </div>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}
export default App;