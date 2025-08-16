import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="fade-in">Welcome to AI Chat Tutor</h1>
        <p className="fade-in-delay">
          Learn smarter with AI-powered chatbots — General Q&A or Domain-Specific (PDF-based).
        </p>
        <div className="hero-buttons fade-in-delay2">
          <button onClick={() => navigate("/chat")} className="btn">
            🚀 Start Chatting
          </button>
          <button onClick={() => navigate("/dsc-chat")} className="btn secondary">
            📄 DS ChatBot
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about fade-in">
        <h2>About This Application</h2>
        <p>
          AI Chat Tutor is a smart learning platform that combines:
        </p>
        <ul>
          <li>
            <span className="icon">💡</span>
            <strong>General AI Chatbot</strong> — Ask questions and get instant answers.
          </li>
          <li>
            <span className="icon">📄</span>
            <strong>Domain-Specific Chatbot</strong> — Upload PDFs and chat with documents.
          </li>
          <li>
            <span className="icon">⚡</span>
            <strong>Seamless Learning Experience</strong> — Easy-to-use, fast, and reliable.
          </li>
        </ul>
        <p>
          Whether you need help with study material or want an interactive chatbot, AI Chat Tutor has you covered.
        </p>
      </section>
    </div>
  );
};

export default Home;
