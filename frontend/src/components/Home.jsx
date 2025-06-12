import React from 'react'
import './Home.css'

const Home = () => {
  return (
    <div className="home-hero">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to AI Chat Tutor 🤖</h1>
        <p className="hero-subtitle">
          Your personal AI tutor ready to help with answers, explanations, and support anytime.
        </p>
        <p className="hero-tip">
          Click <strong>💬 ChatBot</strong> in the top right to start chatting!
        </p>
      </div>
    </div>
  )
}

export default Home
