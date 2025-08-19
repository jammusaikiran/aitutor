import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.post(
  //       import.meta.env.VITE_API_URL + "/api/auth/login",
  //       { email, password }
  //     );
  //     localStorage.setItem("token", res.data.token);
  //     if (res.data.user) {
  //       localStorage.setItem(
  //         "userInfo",
  //         JSON.stringify({
  //           name: res.data.user.name,
  //           email: res.data.user.email,
  //           role: res.data.user.role,
  //         })
  //       );
  //     }
  //     window.dispatchEvent(new Event("authChange"));
  //     navigate(res.data.role === "admin" ? "/" : "/");
  //   } catch (err) {
  //     alert("Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
  setLoading(true);
  try {
    const res = await axios.post(
      import.meta.env.VITE_API_URL + "/api/auth/login",
      { email, password }
    );

    localStorage.setItem("token", res.data.token);

    if (res.data.user) {
      // ✅ store userInfo only
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
    }

    // ✅ remove old "user" key if exists
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  } catch (err) {
    alert("Login failed");
  } finally {
    setLoading(false);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 md:p-10 border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Sign in to access your account
        </p>

        <div className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Don’t have an account?</p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-3 inline-block text-blue-600 font-medium hover:text-blue-700 transition"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
