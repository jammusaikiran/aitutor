import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatPage from './components/ChatPage';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DSCChatBot from './components/DSCChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Title from './components/Title';
import './App.css';

// ✅ react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Title />
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ✅ protected routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsc-chat"
            element={
              <ProtectedRoute>
                <DSCChatBot />
              </ProtectedRoute>
            }
          />

          {/* Admin route protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>

      {/* ✅ Toast in center top */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
