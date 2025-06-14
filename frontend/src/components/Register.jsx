import {useState} from 'react'
import API from '../services/api'
import axios from 'axios'
import './Register.css'

function Register(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState('')
  const [messageType,setMessageType]=useState('')

  const handleRegister=async()=>{
    setLoading(true)
    setMessage('')
    
    try{
      await axios.post('/api/auth/register',{name,email,password})
      setMessage('Registration successful! You can now login.')
      setMessageType('success')
      // Clear form
      setName('')
      setEmail('')
      setPassword('')
    }catch(err){
      setMessage('Registration failed. Please try again.')
      setMessageType('error')
    }finally{
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister()
    }
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: '', text: '' }
    if (password.length < 6) return { strength: 'weak', text: 'Weak' }
    if (password.length < 10) return { strength: 'medium', text: 'Medium' }
    return { strength: 'strong', text: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(password)

  return(
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        
        {message && (
          <div className={`${messageType}-message`}>
            {message}
          </div>
        )}

        <input 
          type="text" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Full Name" 
          required
        />
        
        <input 
          type="email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Email Address" 
          required
        />
        
        <input 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Password" 
          required
        />
        
        {password && (
          <div className="password-strength">
            <div className="strength-bar">
              <div className={`strength-fill strength-${passwordStrength.strength}`}></div>
            </div>
            <div className="strength-text">
              Password strength: {passwordStrength.text}
            </div>
          </div>
        )}
        
        <button 
          onClick={handleRegister} 
          disabled={loading || !name || !email || !password}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="register-links">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  )
}

export default Register