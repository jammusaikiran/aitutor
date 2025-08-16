import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    if (userId) {
      setSelectedUserId(userId);
      fetchUsers(userId);
      fetchChatHistory(userId);
    } else {
      fetchUsers();
    }
  }, []);

  const fetchUsers = (userId = null) => {
    setLoadingUsers(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
        if (userId) {
          const user = res.data.find((u) => u._id === userId);
          if (user) setSelectedUserEmail(user.email);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch users");
      })
      .finally(() => setLoadingUsers(false));
  };

  const deleteChats = (userId) => {
    if (!window.confirm("Delete all chats of this user?")) return;
    axios
      .delete(import.meta.env.VITE_API_URL + `/api/admin/user/${userId}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Chats deleted for this user");
        if (selectedUserId === userId) {
          setChatHistory([]);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete chats");
      });
  };

  const fetchChatHistory = (userId) => {
    setLoadingChats(true);
    setChatHistory([]);
    axios
      .get(import.meta.env.VITE_API_URL + `/api/admin/chats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setChatHistory(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch chat history");
      })
      .finally(() => setLoadingChats(false));
  };

  const viewChatHistory = (userId, email) => {
    window.location.href = `?userId=${userId}`;
  };

  const deleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their chats?")) return;
    axios
      .delete(import.meta.env.VITE_API_URL + `/api/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUsers(users.filter((u) => u._id !== userId));
        alert("User and their chats deleted");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete user");
      });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter((user) =>
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSuggestionClick = (user) => {
    setSearchQuery(user.email);
    setFilteredUsers([]);
    viewChatHistory(user._id, user.email);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 text-black">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-6">
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Search user by email..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {filteredUsers.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded-md mt-1 shadow-lg w-full text-black">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSuggestionClick(user)}
              >
                {user.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loadingUsers ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : selectedUserId ? (
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 text-black">
          <button
            onClick={() => (window.location.href = window.location.pathname)}
            className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ⬅ Back
          </button>
          <h3 className="text-xl font-semibold mb-6 text-black">
            Chat History for{" "}
            <span className="text-blue-600 font-medium">
              {selectedUserEmail || selectedUserId}
            </span>
          </h3>

          {users.length > 0 &&
            (() => {
              const user = users.find((u) => u._id === selectedUserId);
              if (!user) return null;
              return (
                <div className="mb-6 p-6 border rounded-xl shadow-md bg-gray-50 text-black hover:shadow-lg transition-shadow">
                  <p className="mb-1">
                    <span className="font-semibold">User ID:</span> {user._id}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Email:</span> {user.email}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Messages:</span> {user.messageCount}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Last Active:</span>{" "}
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : "Never"}
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <button
                      onClick={() => deleteChats(user._id)}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                    >
                      Delete Chats
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              );
            })()}

          {loadingChats ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500"></div>
            </div>
          ) : chatHistory.length === 0 ? (
            <p className="text-black italic">No chat history found.</p>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-100 rounded-lg shadow-sm text-black hover:bg-gray-200 transition"
                >
                  <p className="mb-2">
                    <strong>Q:</strong> {msg.question}
                  </p>
                  <p>
                    <strong>A:</strong> {msg.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-black">
              Total Distinct Users: <b>{users.length}</b>
            </h3>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              onClick={() => fetchUsers()}
            >
              🔄 Refresh
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-black max-w-3xl mx-auto">All Users</h3>
          <ul className="space-y-4 max-w-3xl mx-auto">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-start bg-white p-6 border rounded-xl shadow hover:shadow-lg transition"
              >
                <div>
                  <b className="block text-lg mb-1">{user.email}</b>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Messages:</span> {user.messageCount}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Last Active:</span>{" "}
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : "Never"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => viewChatHistory(user._id, user.email)}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                  >
                    View Chats
                  </button>
                  <button
                    onClick={() => deleteChats(user._id)}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                  >
                    Delete Chats
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete User
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
