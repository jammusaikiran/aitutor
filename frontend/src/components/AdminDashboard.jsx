import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserEmail, setSelectedUserEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    if (userId) {
      setSelectedUserId(userId)
      fetchUsers(userId)
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
      if (userId) {
        const user = res.data.find(u => u._id === userId)
        if (user) setSelectedUserEmail(user.email)
      }
    })
  }

  const deleteChats = (userId) => {
    if (!window.confirm('Delete all chats of this user?')) return
    axios.delete(import.meta.env.VITE_API_URL + `/api/admin/user/${userId}/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert('Chats deleted for this user')
      if (selectedUserId === userId) {
        setChatHistory([])
      }
    }).catch(err => {
      console.error(err)
      alert('Failed to delete chats')
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

  const viewChatHistory = (userId, email) => {
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

  // --- Search Handling ---
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim() === '') {
      setFilteredUsers([])
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }

  const handleSuggestionClick = (user) => {
    setSearchQuery(user.email)
    setFilteredUsers([])
    viewChatHistory(user._id, user.email)
  }

  return (
    <div className="admin-dashboard full-width">
      
      {/* --- Search Bar --- */}
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search user by email..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {filteredUsers.length > 0 && (
          <ul className="suggestions">
            {filteredUsers.map(user => (
              <li key={user._id} onClick={() => handleSuggestionClick(user)}>
                {user.email}
              </li>
            ))}
          </ul>
        )}
      </div>

        {!selectedUserId && (
          <>
            <div className="users-header">
              <h3>Total Distinct Users: <b>{users.length}</b></h3>
              <button className="refresh-button" onClick={() => fetchUsers()}>
                🔄 Refresh
              </button>
            </div>
          </>
        )}


      {selectedUserId ? (
        <div className="chat-history">
          <button onClick={() => window.location.href = window.location.pathname} className='back-button'>⬅ Back</button>
          <h3>
            Chat History for <span className="user-email">{selectedUserEmail || selectedUserId}</span>
          </h3>

          {/* --- User Details Section --- */}
          {users.length > 0 && (() => {
            const user = users.find(u => u._id === selectedUserId)
            if (!user) return null
            return (
              <div className="user-details-card" >
                <p><b>User ID:</b> {user._id}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Messages:</b> {user.messageCount}</p>
                <p><b>Last Active:</b> {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</p>
                <div className="user-actions">
                  <button onClick={() => deleteChats(user._id)} style={{backgroundColor:'lightblue'}}>Delete Chats</button>
                  <button onClick={() => deleteUser(user._id)} style={{backgroundColor:'pink'}}>Delete User</button>
                </div>
              </div>
            )
          })()}

          {/* --- Chat History Section --- */}
          {loadingChats ? (
            <p>Loading <span className="loading-spinner"></span></p>
          ) : chatHistory.length === 0 ? (
            <p className="empty-state">No chat history found.</p>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className="chat-card">
                <p className="question"><strong>Q:</strong> {msg.question}</p>
                <p className="answer"><strong>A:</strong> {msg.answer}</p>
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
                <div>
                  <b>{user.email}</b>
                  <p>Messages: {user.messageCount}</p>
                  <p>Last Active: {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <button onClick={() => viewChatHistory(user._id, user.email)}>View Chats</button>
                  <button onClick={() => deleteChats(user._id)}>Delete Chats</button>
                  <button onClick={() => deleteUser(user._id)}>Delete User</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
