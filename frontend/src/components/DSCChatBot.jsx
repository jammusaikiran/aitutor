import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function ChatListItem({ chat, activeChat, setActiveChat, setNewChatMode, handleRenameChat, handleDeleteChat }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chat.chat_name || "New Chat");

  return (
    <ListItem
      key={chat._id}
      selected={activeChat?._id === chat._id}
      sx={{
        "&:hover .actions": { opacity: 1 },
      }}
    >
      {isEditing ? (
        <TextField
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={() => {
            handleRenameChat(chat._id, newName);
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRenameChat(chat._id, newName);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <ListItemText
          primary={chat.chat_name || "New Chat"}
          onClick={() => {
            setActiveChat(chat);
            setNewChatMode(false);
          }}
        />
      )}

      {/* Hover actions */}
      <Box
        className="actions"
        sx={{ opacity: 0, transition: "0.2s", display: "flex" }}
      >
        <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ ml: 1 }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDeleteChat(chat._id)} sx={{ ml: 1 }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </ListItem>
  );
}

function App() {
  const [userId] = useState("user-123"); // Replace with real user ID
  const [pdfFile, setPdfFile] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfTraining, setPdfTraining] = useState(false);
  const [newChatMode, setNewChatMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/chats/${userId}`);
      const sorted = sortChats(res.data);
      setChatSessions(sorted);
      if (sorted.length > 0 && !activeChat) {
        setActiveChat(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sortChats = (chats) => {
    return chats.sort((a, b) => {
      const aTime = a.messages?.length
        ? new Date(a.messages[a.messages.length - 1].timestamp)
        : new Date(a.created_at);
      const bTime = b.messages?.length
        ? new Date(b.messages[b.messages.length - 1].timestamp)
        : new Date(b.created_at);
      return bTime - aTime;
    });
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("user_id", userId);
    formData.append("chat_name", pdfFile.name);

    try {
      setPdfTraining(true);
      const res = await axios.post("http://localhost:5001/train", formData);
      const newChat = res.data.chat;

      if (newChat) {
        const updated = sortChats([newChat, ...chatSessions]);
        setChatSessions(updated);
        setActiveChat(newChat);
      } else {
        fetchChats();
      }

      setPdfFile(null);
      setNewChatMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPdfTraining(false);
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setQuestion("");
    setNewChatMode(true);
  };

  const handleSendQuestion = async () => {
    if (!question || !activeChat) return;
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/query", {
        user_id: userId,
        chat_id: activeChat._id,
        question,
      });

      const updatedChat = {
        ...activeChat,
        messages: [
          ...(activeChat.messages || []),
          { question, answer: res.data.answer, timestamp: new Date() },
        ],
      };

      setActiveChat(updatedChat);
      const updatedSessions = chatSessions.map((c) =>
        c._id === activeChat._id ? updatedChat : c
      );
      setChatSessions(sortChats(updatedSessions));

      setQuestion("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameChat = async (chatId, newName) => {
    try {
      await axios.post("http://localhost:5001/chats/rename", {
        chatId,
        newName,
      });
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

const handleDeleteChat = async (chatId) => {
  try {
    console.log("🗑 Deleting chat:", chatId); // Debug log
    await axios.post("http://localhost:5001/chats/delete", { chatId });
    setChatSessions(chatSessions.filter((c) => c._id !== chatId));
    if (activeChat?._id === chatId) {
      setActiveChat(null);
      setNewChatMode(true);
    }
  } catch (err) {
    console.error("❌ Delete error:", err.response?.data || err.message);
  }
};



  return (
    <Box display="flex" height="100vh" sx={{ fontFamily: "Arial, sans-serif" }} overflow="hidden" marginTop="60px" position="fixed">
      {/* Sidebar */}
      <Paper sx={{ width: 300, overflowY: "auto", p: 2, bgcolor: "#f0f2f5" }}>
        <Typography variant="h6">Chats</Typography>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1, mb: 2 }}
          onClick={handleNewChat}
        >
          New Chat
        </Button>
        <Divider sx={{ mb: 2 }} />
        <List>
          {chatSessions.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              setNewChatMode={setNewChatMode}
              handleRenameChat={handleRenameChat}
              handleDeleteChat={handleDeleteChat}
            />
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box flex={1} display="flex" flexDirection="column" p={2}>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            mb: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#e5ddd5",
            minWidth: "130vh",
            maxHeight: "70vh",
            width: "100%",
            height: "100%",
          }}

        >
          {newChatMode ? (
            <Box textAlign="center" mt="auto" mb="auto">
              <Typography variant="h6" gutterBottom>
                Start a new chat by uploading a PDF
              </Typography>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePdfUpload}
                sx={{ mt: 2 }}
                disabled={!pdfFile || pdfTraining}
              >
                {pdfTraining ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Training PDF...
                  </>
                ) : (
                  "Upload PDF"
                )}
              </Button>
            </Box>
          ) : activeChat?.messages?.length ? (
            activeChat.messages.map((msg, idx) => (
              <Box key={idx} mb={2} display="flex" flexDirection="column">
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    p: 1.5,
                    bgcolor: "#dcf8c6",
                    borderRadius: "15px 15px 0 15px",
                    maxWidth: "60%",
                  }}
                >
                  <Typography variant="body1">{msg.question}</Typography>
                </Box>
                <Box
                  sx={{
                    alignSelf: "flex-end",
                    p: 1.5,
                    bgcolor: "#fff",
                    borderRadius: "15px 15px 15px 0",
                    maxWidth: "60%",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body1">{msg.answer}</Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              sx={{ mt: "auto", mb: "auto" }}
            >
              No messages yet. Start chatting!
            </Typography>
          )}

          {loading && (
            <Box mb={2} alignSelf="flex-end">
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: "15px 15px 15px 0",
                  maxWidth: "60%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Typing...
                </Typography>
                <CircularProgress size={14} />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>

        {!newChatMode && activeChat && (
          <Box display="flex">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendQuestion}
              disabled={loading || !activeChat}
              sx={{ ml: 1 }}
            >
              Send
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
