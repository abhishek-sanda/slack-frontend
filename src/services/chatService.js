import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io(import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:4001");
const API = import.meta.env.VITE_CHAT_API_URL || "http://localhost:4001/api";

export function useChat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch existing messages on mount
    axios.get(`${API}/chat`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));

    // Socket event handlers
    const onNew = msg => setMessages(prev => [...prev, msg]);
    const onEdit = updated => setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    const onDelete = id => setMessages(prev => prev.filter(m => m._id !== id));
    const onPin = updated => setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    const onReact = updated => setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));

    socket.on("chat-message", onNew);
    socket.on("edit-message", onEdit);
    socket.on("delete-message", onDelete);
    socket.on("pin-message", onPin);
    socket.on("react-message", onReact);

    return () => {
      socket.off("chat-message", onNew);
      socket.off("edit-message", onEdit);
      socket.off("delete-message", onDelete);
      socket.off("pin-message", onPin);
      socket.off("react-message", onReact);
    };
  }, []);

  // Actions
  const sendMessage = useCallback((text, user, chatRoom, replyTo, attachments) => {
    socket.emit("chat-message", { user, text, chatRoom, replyTo, attachments });
  }, []);
  const editMessage = useCallback((id, text, attachments) => {
    socket.emit("edit-message", { id, text, attachments });
  }, []);
  const deleteMessage = useCallback(id => {
    socket.emit("delete-message", id);
  }, []);
  const pinMessage = useCallback((id, pin) => {
    socket.emit("pin-message", { id, pin });
  }, []);
  const reactMessage = useCallback((id, user, emoji) => {
    socket.emit("react-message", { id, user, emoji });
  }, []);

  return { messages, sendMessage, editMessage, deleteMessage, pinMessage, reactMessage };
}