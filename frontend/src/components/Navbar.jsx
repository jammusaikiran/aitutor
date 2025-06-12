import React, {useState, useEffect} from 'react'
import './Navbar.css'
import {useNavigate, Link} from 'react-router-dom'

const Navbar = () => {
  const [userEmail,setUserEmail]=useState('')
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [isMobileMenuOpen,setIsMobileMenuOpen]=useState(false)
  const navigate=useNavigate()

  const checkAuthStatus=()=>{
    const token=localStorage.getItem('token')
    if(token){
      setIsLoggedIn(true)
      try{
        const payload=JSON.parse(atob(token.split('.')[1]))
        console.log('Decoded token payload:', payload)

        setUserEmail(payload.email || 'User')
        setIsAdmin(payload.role==='admin')
      }catch(err){
        console.error('Error decoding token:',err)
        setUserEmail('User')
        setIsAdmin(false)
      }
    }else{
      setIsLoggedIn(false)
      setUserEmail('')
      setIsAdmin(false)
    }
  }

  useEffect(()=>{
    checkAuthStatus()

    const handleStorageChange=()=>checkAuthStatus()
    window.addEventListener('storage',handleStorageChange)
    window.addEventListener('authChange',handleStorageChange)

    return ()=>{
      window.removeEventListener('storage',handleStorageChange)
      window.removeEventListener('authChange',handleStorageChange)
    }
  },[])

  const handleChatBot=()=>{
    if(!isLoggedIn){
      alert('Please login first to access the chatbot')
      navigate('/login')
    }else{
      navigate('/chat')
    }
  }

  const handleAuthAction=()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setIsLoggedIn(false)
    setUserEmail('')
    setIsAdmin(false)
    navigate('/login')
    window.dispatchEvent(new Event('authChange'))
  }

  const getInitials=(email)=>email?.slice(0,2).toUpperCase()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>ChatBot App</h2>
        </Link>

        <div className="hamburger" onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </div>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <button className="chatbot-btn" onClick={handleChatBot}>
            <span className="btn-icon">💬</span> ChatBot
          </button>

          {isAdmin && (
            <button className="admin-btn" onClick={()=>navigate('/admin')}>
              👥 Manage Users
            </button>
          )}

          {isLoggedIn && (
            <div className="user-profile">
              <div className="profile-icon">{getInitials(userEmail)}</div>
              <span className="user-name">{userEmail}</span>
            </div>
          )}

          <button className="logout-btn" onClick={handleAuthAction}>
            <span className="btn-icon">{isLoggedIn ? '🚪' : '🔐'}</span>
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
