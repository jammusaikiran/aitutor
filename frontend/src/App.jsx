import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ChatPage from './components/ChatPage'
import AdminDashboard from './components/AdminDashboard'
import Navbar from './components/Navbar'
import Home from './components/Home'
import './App.css'

function App(){
  return (
    <BrowserRouter>
      <Navbar />
       <div className="app-container">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<Dashboard role="User" />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
       </div>
    </BrowserRouter>
  )
}

export default App
