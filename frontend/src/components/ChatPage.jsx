import React, {useState, useEffect, useRef} from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import './ChatPage.css'

const ChatPage = () => {
  const [question,setQuestion]=useState('')
  const [chats,setChats]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const chatEndRef=useRef(null)
  const BASE_URL="http://localhost:5000"

  const fetchHistory=async()=>{
    try {
      const res=await axios.get(`/api/chat/history`, {
        headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}
      })
      if(Array.isArray(res.data)) setChats(res.data.reverse())
      else setChats([])
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  const handleSend=async()=>{
    if(!question.trim()) return
    const tempChat={question,answer:'Typing...',createdAt:new Date().toISOString()}
    setChats(prev=>[...prev,tempChat])
    setLoading(true)

    try {
      const res=await axios.post(`/api/chat`, {question}, {
        headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}
      })
      setChats(prev=>[...prev.slice(0,-1), res.data])
      setQuestion('')
    } catch (err) {
      console.log("Send error:", err)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
  }

  useEffect(()=>{ fetchHistory() },[])
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}) },[chats])

  return (
    <div className="chat-container">
      <h2>🤖 AI Chat Tutor</h2>

      <div className="chat-box">
        {chats.length===0 && <div className="empty-chat">Start a conversation...</div>}

        <ul>
          {chats.map((chat,i)=>(
            <li key={i} className="chat-message">
              <div className="msg user-msg">
                <div className="avatar">🧑</div>
                <div className="msg-content">
                  <div className="meta">
                    <span className="sender">You</span>
                    <span className="time">{formatDate(chat.createdAt)}</span>
                  </div>
                  <p>{chat.question}</p>
                </div>
              </div>

              <div className="msg bot-msg">
                <div className="avatar">🤖</div>
                <div className="msg-content">
                  <div className="meta">
                    <span className="sender">Bot</span>
                    <span className="time">{formatDate(chat.createdAt)}</span>
                  </div>
                  <ReactMarkdown>{chat.answer}</ReactMarkdown>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div ref={chatEndRef}></div>
      </div>

      <div className="input-box">
        <input 
          value={question} 
          onChange={e=>setQuestion(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder="Ask something..." 
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ChatPage
