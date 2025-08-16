import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.email || 'User');
        setIsAdmin(payload.role === 'admin');
      } catch (err) {
        setUserEmail('User');
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const handleChatBot = () => {
    if (!isLoggedIn) {
      alert('Please login first to access the chatbot');
      navigate('/login');
    } else {
      navigate('/chat');
    }
  };

  const handleAuthAction = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserEmail('');
    setIsAdmin(false);
    navigate('/login');
    window.dispatchEvent(new Event('authChange'));
  };

  const getInitials = (email) => email?.slice(0, 2).toUpperCase();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full bg-gradient-to-r from-[#003366] to-[#1E40AF] shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h2 className="text-2xl font-extrabold text-white tracking-wider">
                SMART LEARNING
              </h2>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <button
                onClick={handleChatBot}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition transform hover:scale-105"
              >
                <span className="mr-2">💬</span> ChatBot
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition transform hover:scale-105"
                >
                  👥 Manage Users
                </button>
              )}

              {isLoggedIn && (
                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full mr-2">
                    {getInitials(userEmail)}
                  </div>
                  <span className="text-gray-800 font-medium">{userEmail}</span>
                </div>
              )}

              <button
                onClick={handleAuthAction}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition transform hover:scale-105"
              >
                <span className="mr-2">{isLoggedIn ? '🚪' : '🔐'}</span>
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div
              className="lg:hidden cursor-pointer text-white text-3xl select-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✖' : '☰'}
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden mt-2 flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
            }`}
          >
            <button
              onClick={handleChatBot}
              className="flex items-center px-4 py-2 mb-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
            >
              <span className="mr-2">💬</span> ChatBot
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center px-4 py-2 mb-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition"
              >
                👥 Manage Users
              </button>
            )}

            {isLoggedIn && (
              <div className="flex items-center px-4 py-2 mb-2 bg-gray-100 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full mr-2">
                  {getInitials(userEmail)}
                </div>
                <span className="text-gray-800 font-medium">{userEmail}</span>
              </div>
            )}

            <button
              onClick={handleAuthAction}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition"
            >
              <span className="mr-2">{isLoggedIn ? '🚪' : '🔐'}</span>
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </nav>

      {/* Add top padding so page content is not hidden behind fixed navbar */}
      <div className="pt-16"></div>
    </>
  );
};

export default Navbar;
