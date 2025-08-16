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
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function ChatListItem({
  chat,
  activeChat,
  setActiveChat,
  setNewChatMode,
  handleRenameChat,
  handleDeleteChat,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chat.chat_name || "New Chat");

  return (
    <ListItem
      key={chat._id}
      selected={activeChat?._id === chat._id}
      className="group hover:bg-gray-200 rounded-md transition flex justify-between items-center px-2 py-1"
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
          className="cursor-pointer font-medium"
          onClick={() => {
            setActiveChat(chat);
            setNewChatMode(false);
          }}
        />
      )}

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <IconButton size="small" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDeleteChat(chat._id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
    </ListItem>
  );
}

function App() {
  const [userId] = useState("user-123");
  const [pdfFile, setPdfFile] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfTraining, setPdfTraining] = useState(false);
  const [newChatMode, setNewChatMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      await axios.post("http://localhost:5001/chats/delete", { chatId });
      setChatSessions(chatSessions.filter((c) => c._id !== chatId));
      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setNewChatMode(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen pt-[60px] bg-gray-100 text-gray-900">
      {/* Sidebar for large screens */}
      <div className="hidden md:flex w-72 bg-white shadow-md p-4 flex-col">
        <h2 className="text-lg font-bold mb-3">Chats</h2>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          className="mb-3"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
        <List className="overflow-y-auto flex-1 space-y-1">
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
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Button
          onClick={() => setSidebarOpen(true)}
          className="m-2"
          variant="outlined"
        >
          <MenuIcon />
        </Button>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex">
            <div className="w-72 bg-white p-4 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Chats</h2>
                <IconButton onClick={() => setSidebarOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                className="mb-3"
                onClick={handleNewChat}
              >
                New Chat
              </Button>
              <List className="overflow-y-auto flex-1 space-y-1">
                {chatSessions.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    activeChat={activeChat}
                    setActiveChat={(c) => {
                      setActiveChat(c);
                      setSidebarOpen(false);
                    }}
                    setNewChatMode={setNewChatMode}
                    handleRenameChat={handleRenameChat}
                    handleDeleteChat={handleDeleteChat}
                  />
                ))}
              </List>
            </div>
            <div
              className="flex-1"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-lg shadow-inner">
          {newChatMode ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Typography variant="h6" gutterBottom>
                Start a new chat by uploading a PDF
              </Typography>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                style={{
                  display: "block",
                  marginTop: "10px",
                  marginBottom: "10px",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              />
              <Button
                variant="contained"
                color="primary"
                className="mt-3"
                disabled={pdfTraining || !pdfFile}
                onClick={handlePdfUpload}
                style={{ background: "var(--color-blue-600)", color: "white" }}
              >
                {pdfTraining ? (
                  <>
                    <CircularProgress size={16} className="mr-2" />
                    Training PDF...
                  </>
                ) : pdfFile ? (
                  "Train PDF"
                ) : (
                  "Upload PDF"
                )}
              </Button>
            </div>
          ) : activeChat?.messages?.length ? (
            activeChat.messages.map((msg, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-md text-sm shadow">
                    {msg.question}
                  </div>
                </div>

                <div className="flex justify-start mt-1">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl max-w-md text-sm shadow">
                    {msg.answer}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-auto mb-auto">
              No messages yet. Start chatting!
            </p>
          )}

          {loading && (
            <div className="flex justify-start mt-2">
              <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-2xl shadow flex items-center gap-2 text-sm">
                <span>Typing...</span>
                <CircularProgress size={14} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {!newChatMode && activeChat && (
          <div className="flex mt-3">
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
              className="ml-2"
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
