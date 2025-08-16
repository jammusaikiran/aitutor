import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const ChatPage = () => {
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + `/api/chat/history`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (Array.isArray(res.data)) setChats(res.data.reverse());
      else setChats([]);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    const tempChat = {
      question,
      answer: "Typing...",
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, tempChat]);
    setLoading(true);

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + `/api/chat`,
        { question },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setChats((prev) => [...prev.slice(0, -1), res.data]);
      setQuestion("");
    } catch (err) {
      console.log("Send error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chats.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Start a conversation...
          </div>
        )}

        <ul className="space-y-4">
          {chats.map((chat, i) => (
            <li key={i} className="space-y-2">
              {/* User Message (Right Side) */}
              <div className="flex items-start space-x-2 justify-end">
                <div className="bg-blue-100 p-3 rounded-lg max-w-lg text-right">
                  <p className="text-gray-800">{chat.question}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    {formatDate(chat.createdAt)}
                  </span>
                </div>
                <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">
                  🧑
                </div>
              </div>

              {/* Bot Message (Left Side) */}
              <div className="flex items-start space-x-2 justify-start">
                <div className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full">
                  🤖
                </div>
                <div className="bg-white p-3 rounded-lg shadow max-w-lg">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="text-gray-700" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      code: ({ node, ...props }) => (
                        <code className="bg-gray-200 px-1 rounded" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc ml-5 text-gray-700" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-5 text-gray-700" {...props} />
                      ),
                    }}
                  >
                    {chat.answer}
                  </ReactMarkdown>
                  <span className="text-xs text-gray-500 block mt-1">
                    {formatDate(chat.createdAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div ref={chatEndRef}></div>
      </div>

      {/* Input box */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT..."
          rows={1}
          className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring focus:ring-blue-300 text-gray-900 placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
