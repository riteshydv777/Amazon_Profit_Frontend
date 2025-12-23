import { useState } from "react";
import { login as loginAPI, setToken } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await loginAPI({ email, password });
      console.log("Login response:", response);
      if (response.token) {
        setToken(response.token);
        localStorage.setItem("userEmail", email);
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Is the backend running on http://localhost:8080?";
      } else if (err.code === "ECONNREFUSED" || err.message === "Network Error") {
        errorMessage = "Cannot connect to backend. Make sure:\n1. Backend is running on http://localhost:8080\n2. CORS is enabled in your Spring Boot application";
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 404) {
        errorMessage = "Backend endpoint not found. Check your API configuration";
      } else if (err.response?.status === 500) {
        errorMessage = `Server error: ${err.response?.data?.message || "Please check backend logs"}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
            <p className="text-blue-100 text-center mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="px-8 pb-8 border-t border-slate-700 pt-6">
            <p className="text-slate-400 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
