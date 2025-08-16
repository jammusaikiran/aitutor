import React, { useEffect, useState } from 'react'
import './Home.css'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check login status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  } 

  useEffect(() => {
    checkAuthStatus()

    // Optional: listen to login/logout changes
    const handleAuthChange = () => checkAuthStatus()
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('authChange', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  const goToDSCBot = () => {
    if (!isLoggedIn) {
      alert('Please login first to access the DSC ChatBot')
      navigate('/login')
    } else {
      navigate('/dsc-chat')
    }
  }

  return (
    <div className="home-hero">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to AI Chat Tutor 🤖</h1>
        <p className="hero-subtitle">
          Your personal AI tutor ready to help with answers, explanations, and support anytime.
        </p>
        <button onClick={goToDSCBot}>DSC ChatBot</button>
        <p className="hero-tip">
          Click <strong>💬 ChatBot</strong> in the top right to start chatting!
        </p>
      </div>
    </div>
  )
}

export default Home
