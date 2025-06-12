import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import API from '../services/api'
import './Login.css'

function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate()

  const handleLogin=async()=>{
  setLoading(true)
  try{
    const res=await API.post('/auth/login',{email,password})
    localStorage.setItem('token',res.data.token)
    
    // Store user info for navbar
    if(res.data.user) {
      localStorage.setItem('userInfo', JSON.stringify({
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role
      }))
    }

    // 🔔 Notify Navbar to update login state
    window.dispatchEvent(new Event('authChange'))

    if(res.data.role==='admin') navigate('/admin')
    else navigate('/')
  }catch(err){
    alert('Login failed')
  }finally{
    setLoading(false)
  }
}


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return(
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back</h2>
        <input 
          type="email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Email Address" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Password" 
        />
        <button 
          onClick={handleLogin} 
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="login-links">
          <p>Don't have an account?</p>
          <button 
            className="register-btn" 
            onClick={() => navigate('/register')}
            type="button"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login