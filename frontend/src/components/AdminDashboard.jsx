import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserEmail, setSelectedUserEmail] = useState(null) // ✅ new state

  const token = localStorage.getItem('token')

  // ✅ On mount, check if URL has userId param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    if (userId) {
      setSelectedUserId(userId)
      fetchUsers(userId) // fetch users so we can find email
      fetchChatHistory(userId)
    } else {
      fetchUsers()
    }
  }, [])

  const fetchUsers = (userId = null) => {
    axios.get(import.meta.env.VITE_API_URL + '/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUsers(res.data)

      // ✅ if we already know which user we want, set email here
      if (userId) {
        const user = res.data.find(u => u._id === userId)
        if (user) setSelectedUserEmail(user.email)
      }
    })
  }

  const fetchChatHistory = (userId) => {
    setLoadingChats(true)
    setChatHistory([])

    axios.get(import.meta.env.VITE_API_URL + `/api/admin/chats/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setChatHistory(res.data)
      setLoadingChats(false)
    }).catch(err => {
      console.error(err)
      setLoadingChats(false)
      alert('Failed to fetch chat history')
    })
  }

  const viewChatHistory = (userId) => {
    // ✅ Redirect to same component with query param
    window.location.href = `?userId=${userId}`
  }

  const deleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their chats?')) return

    axios.delete(import.meta.env.VITE_API_URL + `/api/admin/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUsers(users.filter(u => u._id !== userId))
      alert('User and their chats deleted')
    }).catch(err => {
      console.error(err)
      alert('Failed to delete user')
    })
  }

  return (
    <div className="admin-dashboard">
      {/* ✅ Show Dashboard title only on main page */}
      {!selectedUserId && <h2>Admin Dashboard</h2>}

      {selectedUserId ? (
        <div className="chat-history">
          <button onClick={() => window.location.href = window.location.pathname}>
            ⬅ Back
          </button>
          <h3>
            Chat History for <span className="user-email">{selectedUserEmail || selectedUserId}</span>
          </h3>
          {loadingChats ? (
            <p>Loading <span className="loading-spinner"></span></p>
          ) : chatHistory.length === 0 ? (
            <p className="empty-state">No chat history found.</p>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className="chat-msg">
                <p><strong>Q:</strong> {msg.question}</p>
                <p><strong>A:</strong> {msg.answer}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <h3>All Users</h3>
          <ul>
            {users.map(user => (
              <li key={user._id} className="user-item">
                <b>{user.email}</b>
                <button onClick={() => viewChatHistory(user._id)}>View Chats</button>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
