import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");

    try {
      await axios.post(import.meta.env.VITE_API_URL + "/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage("Registration successful! You can now login.");
      setMessageType("success");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: "", text: "" };
    if (password.length < 6) return { strength: "weak", text: "Weak" };
    if (password.length < 10) return { strength: "medium", text: "Medium" };
    return { strength: "strong", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 md:p-10 border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Sign up to get started
        </p>

        {message && (
          <div
            className={`mb-4 text-sm text-center px-4 py-2 rounded-lg ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Email Address"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {password && (
            <div>
              <div className="h-2 w-full bg-gray-200 rounded-xl overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.strength === "weak"
                      ? "bg-red-500 w-1/3"
                      : passwordStrength.strength === "medium"
                      ? "bg-yellow-500 w-2/3"
                      : passwordStrength.strength === "strong"
                      ? "bg-green-500 w-full"
                      : "w-0"
                  }`}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Password strength:{" "}
                <span
                  className={`font-semibold ${
                    passwordStrength.strength === "weak"
                      ? "text-red-600"
                      : passwordStrength.strength === "medium"
                      ? "text-yellow-600"
                      : passwordStrength.strength === "strong"
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  {passwordStrength.text}
                </span>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleRegister}
          disabled={loading || !name || !email || !password}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
