import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center mt-16 lg:mt-24 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in">
          Welcome to AI Chat Tutor
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 animate-fade-in delay-200">
          Learn smarter with AI-powered chatbots — General Q&A or Domain-Specific (PDF-based).
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in delay-400">
          <button
            onClick={() => navigate("/chat")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105"
          >
            🚀 Start Chatting
          </button>
          <button
            onClick={() => navigate("/dsc-chat")}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition transform hover:scale-105"
          >
            📄 DS ChatBot
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-20 lg:mt-32 max-w-4xl text-left animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">About This Application</h2>
        <p className="text-gray-700 mb-4">
          AI Chat Tutor is a smart learning platform that combines:
        </p>
        <ul className="space-y-3 mb-4">
          <li className="flex items-start gap-2 text-gray-700">
            <span className="text-xl">💡</span>
            <span>
              <strong>General AI Chatbot</strong> — Ask questions and get instant answers.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-700">
            <span className="text-xl">📄</span>
            <span>
              <strong>Domain-Specific Chatbot</strong> — Upload PDFs and chat with documents.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-700">
            <span className="text-xl">⚡</span>
            <span>
              <strong>Seamless Learning Experience</strong> — Easy-to-use, fast, and reliable.
            </span>
          </li>
        </ul>
        <p className="text-gray-700">
          Whether you need help with study material or want an interactive chatbot, AI Chat Tutor has you covered.
        </p>
      </section>

      {/* Tailwind Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out forwards;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-400 {
            animation-delay: 0.4s;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
