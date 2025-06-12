import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUsers(res.data))
  }, [])

  const viewChatHistory = (userId) => {
    setSelectedUserId(userId)
    setLoadingChats(true)
    setChatHistory([])

    axios.get(`/api/admin/chats/${userId}`, {
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

  const deleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their chats?')) return

    axios.delete(`/api/admin/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUsers(users.filter(u => u._id !== userId))
      if (selectedUserId === userId) {
        setSelectedUserId(null)
        setChatHistory([])
      }
      alert('User and their chats deleted')
    }).catch(err => {
      console.error(err)
      alert('Failed to delete user')
    })
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
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

      {selectedUserId && (
        <div className="chat-history">
          <h3>Chat History for User ID: {selectedUserId}</h3>
          {loadingChats ? (
            <p>Loading...</p>
          ) : chatHistory.length === 0 ? (
            <p>No chat history found.</p>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className="chat-msg">
                <p><strong>Q:</strong> {msg.question}</p>
                <p><strong>A:</strong> {msg.answer}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
